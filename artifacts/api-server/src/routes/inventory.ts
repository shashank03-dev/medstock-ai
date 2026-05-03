import { Router } from "express";
import { db } from "@workspace/db";
import { skusTable, departmentsTable, stockMovementsTable, expiryBatchesTable } from "@workspace/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { UpdateStockBody } from "@workspace/api-zod";

const router = Router();

function getStatus(currentStock: number, reorderPoint: number, safetyStock: number): "critical" | "low" | "adequate" {
  if (currentStock <= safetyStock) return "critical";
  if (currentStock <= reorderPoint) return "low";
  return "adequate";
}

router.get("/inventory", async (req, res) => {
  try {
    const rows = await db
      .select({
        skuId: skusTable.id,
        name: skusTable.name,
        category: skusTable.category,
        departmentId: skusTable.departmentId,
        currentStock: skusTable.currentStock,
        unit: skusTable.unit,
        reorderPoint: skusTable.reorderPoint,
        safetyStock: skusTable.safetyStock,
        unitCost: skusTable.unitCost,
        supplier: skusTable.supplier,
        updatedAt: skusTable.updatedAt,
        departmentName: departmentsTable.name,
      })
      .from(skusTable)
      .leftJoin(departmentsTable, eq(skusTable.departmentId, departmentsTable.id));

    const expiryRows = await db
      .select({
        skuId: expiryBatchesTable.skuId,
        expiryDate: sql<string>`min(${expiryBatchesTable.expiryDate})`,
      })
      .from(expiryBatchesTable)
      .where(eq(expiryBatchesTable.status, "active"))
      .groupBy(expiryBatchesTable.skuId);
    const expiryMap = new Map(expiryRows.map((e) => [e.skuId, e.expiryDate]));

    let result = rows.map((r) => ({
      skuId: r.skuId,
      name: r.name,
      category: r.category,
      departmentId: r.departmentId,
      departmentName: r.departmentName ?? "Unknown",
      currentStock: r.currentStock,
      unit: r.unit,
      reorderPoint: r.reorderPoint,
      safetyStock: r.safetyStock,
      status: getStatus(r.currentStock, r.reorderPoint, r.safetyStock),
      unitCost: r.unitCost,
      supplier: r.supplier ?? null,
      nearestExpiryDate: expiryMap.get(r.skuId) ?? null,
      lastUpdated: r.updatedAt,
    }));

    if (req.query.departmentId) {
      result = result.filter((r) => r.departmentId === parseInt(req.query.departmentId as string, 10));
    }
    if (req.query.status) {
      result = result.filter((r) => r.status === req.query.status);
    }
    if (req.query.category) {
      result = result.filter((r) => r.category.toLowerCase() === (req.query.category as string).toLowerCase());
    }

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Error listing inventory");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/inventory/update-stock", async (req, res) => {
  try {
    const body = UpdateStockBody.parse(req.body);
    const [sku] = await db.select().from(skusTable).where(eq(skusTable.id, body.skuId));
    if (!sku) return res.status(404).json({ error: "SKU not found" });

    let newStock = sku.currentStock;
    if (body.transactionType === "receipt") newStock += body.quantity;
    else if (body.transactionType === "consumption") newStock = Math.max(0, newStock - body.quantity);
    else newStock = body.quantity;

    const today = new Date().toISOString().split("T")[0];
    await db.insert(stockMovementsTable).values({
      skuId: body.skuId,
      date: today,
      type: body.transactionType,
      quantity: body.quantity,
      runningTotal: newStock,
      notes: body.notes ?? null,
    });

    const [updated] = await db
      .update(skusTable)
      .set({ currentStock: newStock, updatedAt: new Date() })
      .where(eq(skusTable.id, body.skuId))
      .returning();

    const dept = await db
      .select({ name: departmentsTable.name })
      .from(departmentsTable)
      .where(eq(departmentsTable.id, updated.departmentId));

    res.json({
      skuId: updated.id,
      name: updated.name,
      category: updated.category,
      departmentId: updated.departmentId,
      departmentName: dept[0]?.name ?? "Unknown",
      currentStock: updated.currentStock,
      unit: updated.unit,
      reorderPoint: updated.reorderPoint,
      safetyStock: updated.safetyStock,
      status: getStatus(updated.currentStock, updated.reorderPoint, updated.safetyStock),
      unitCost: updated.unitCost,
      supplier: updated.supplier ?? null,
      nearestExpiryDate: null,
      lastUpdated: updated.updatedAt,
    });
  } catch (err) {
    req.log.error({ err }, "Error updating stock");
    res.status(400).json({ error: "Invalid request" });
  }
});

router.get("/inventory/categories", async (req, res) => {
  try {
    const categories = await db
      .selectDistinct({ category: skusTable.category })
      .from(skusTable)
      .orderBy(skusTable.category);
    res.json(categories.map((c) => c.category));
  } catch (err) {
    req.log.error({ err }, "Error listing categories");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
