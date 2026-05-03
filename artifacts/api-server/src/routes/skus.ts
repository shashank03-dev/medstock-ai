import { Router } from "express";
import { db } from "@workspace/db";
import { skusTable, departmentsTable, expiryBatchesTable } from "@workspace/db/schema";
import { eq, and, ilike, lte, sql } from "drizzle-orm";
import { CreateSkuBody, UpdateSkuBody, ListSkusQueryParams } from "@workspace/api-zod";

const router = Router();

function getStatus(currentStock: number, reorderPoint: number, safetyStock: number): "critical" | "low" | "adequate" {
  if (currentStock <= safetyStock) return "critical";
  if (currentStock <= reorderPoint) return "low";
  return "adequate";
}

router.get("/skus", async (req, res) => {
  try {
    const params = ListSkusQueryParams.parse(req.query);

    const rows = await db
      .select({
        id: skusTable.id,
        name: skusTable.name,
        category: skusTable.category,
        unit: skusTable.unit,
        unitCost: skusTable.unitCost,
        supplier: skusTable.supplier,
        departmentId: skusTable.departmentId,
        currentStock: skusTable.currentStock,
        reorderPoint: skusTable.reorderPoint,
        safetyStock: skusTable.safetyStock,
        createdAt: skusTable.createdAt,
        updatedAt: skusTable.updatedAt,
        departmentName: departmentsTable.name,
      })
      .from(skusTable)
      .leftJoin(departmentsTable, eq(skusTable.departmentId, departmentsTable.id));

    const today = new Date().toISOString().split("T")[0];

    // get earliest expiry per sku
    const expiryRows = await db
      .select({
        skuId: expiryBatchesTable.skuId,
        expiryDate: sql<string>`min(${expiryBatchesTable.expiryDate})`,
      })
      .from(expiryBatchesTable)
      .where(eq(expiryBatchesTable.status, "active"))
      .groupBy(expiryBatchesTable.skuId);
    const expiryMap = new Map(expiryRows.map((e) => [e.skuId, e.expiryDate]));

    let result = rows.map((sku) => ({
      ...sku,
      departmentName: sku.departmentName ?? "Unknown",
      status: getStatus(sku.currentStock, sku.reorderPoint, sku.safetyStock),
      nearestExpiryDate: expiryMap.get(sku.id) ?? null,
    }));

    if (params.departmentId) {
      result = result.filter((s) => s.departmentId === params.departmentId);
    }
    if (params.category) {
      result = result.filter((s) => s.category.toLowerCase() === params.category!.toLowerCase());
    }
    if (params.status) {
      result = result.filter((s) => s.status === params.status);
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      result = result.filter((s) => s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q));
    }
    if (params.expiryWithinDays) {
      const cutoff = new Date(Date.now() + params.expiryWithinDays * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      result = result.filter((s) => s.nearestExpiryDate && s.nearestExpiryDate <= cutoff);
    }

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Error listing SKUs");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/skus", async (req, res) => {
  try {
    const body = CreateSkuBody.parse(req.body);
    const [sku] = await db.insert(skusTable).values(body).returning();
    const dept = await db.select({ name: departmentsTable.name }).from(departmentsTable).where(eq(departmentsTable.id, sku.departmentId));
    res.status(201).json({
      ...sku,
      departmentName: dept[0]?.name ?? "Unknown",
      status: getStatus(sku.currentStock, sku.reorderPoint, sku.safetyStock),
      nearestExpiryDate: null,
    });
  } catch (err) {
    req.log.error({ err }, "Error creating SKU");
    res.status(400).json({ error: "Invalid request" });
  }
});

router.get("/skus/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const [sku] = await db
      .select({
        id: skusTable.id,
        name: skusTable.name,
        category: skusTable.category,
        unit: skusTable.unit,
        unitCost: skusTable.unitCost,
        supplier: skusTable.supplier,
        departmentId: skusTable.departmentId,
        currentStock: skusTable.currentStock,
        reorderPoint: skusTable.reorderPoint,
        safetyStock: skusTable.safetyStock,
        createdAt: skusTable.createdAt,
        updatedAt: skusTable.updatedAt,
        departmentName: departmentsTable.name,
      })
      .from(skusTable)
      .leftJoin(departmentsTable, eq(skusTable.departmentId, departmentsTable.id))
      .where(eq(skusTable.id, id));
    if (!sku) return res.status(404).json({ error: "Not found" });

    const expiryRow = await db
      .select({ expiryDate: sql<string>`min(${expiryBatchesTable.expiryDate})` })
      .from(expiryBatchesTable)
      .where(and(eq(expiryBatchesTable.skuId, id), eq(expiryBatchesTable.status, "active")));

    res.json({
      ...sku,
      departmentName: sku.departmentName ?? "Unknown",
      status: getStatus(sku.currentStock, sku.reorderPoint, sku.safetyStock),
      nearestExpiryDate: expiryRow[0]?.expiryDate ?? null,
    });
  } catch (err) {
    req.log.error({ err }, "Error getting SKU");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/skus/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const body = UpdateSkuBody.parse(req.body);
    const [sku] = await db
      .update(skusTable)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(skusTable.id, id))
      .returning();
    if (!sku) return res.status(404).json({ error: "Not found" });
    const dept = await db.select({ name: departmentsTable.name }).from(departmentsTable).where(eq(departmentsTable.id, sku.departmentId));
    res.json({
      ...sku,
      departmentName: dept[0]?.name ?? "Unknown",
      status: getStatus(sku.currentStock, sku.reorderPoint, sku.safetyStock),
      nearestExpiryDate: null,
    });
  } catch (err) {
    req.log.error({ err }, "Error updating SKU");
    res.status(400).json({ error: "Invalid request" });
  }
});

router.delete("/skus/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await db.delete(skusTable).where(eq(skusTable.id, id));
    res.json({ success: true, message: "SKU deleted" });
  } catch (err) {
    req.log.error({ err }, "Error deleting SKU");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/skus/:id/movement-history", async (req, res) => {
  try {
    const { stockMovementsTable } = await import("@workspace/db/schema");
    const id = parseInt(req.params.id, 10);
    const days = parseInt((req.query.days as string) || "30", 10);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const movements = await db
      .select()
      .from(stockMovementsTable)
      .where(and(eq(stockMovementsTable.skuId, id), sql`${stockMovementsTable.date} >= ${since}`))
      .orderBy(stockMovementsTable.date);
    res.json(movements);
  } catch (err) {
    req.log.error({ err }, "Error fetching movement history");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
