import { Router } from "express";
import { db } from "@workspace/db";
import { alertsTable, skusTable, departmentsTable } from "@workspace/db/schema";
import { eq, and, sql } from "drizzle-orm";

const router = Router();

router.get("/alerts", async (req, res) => {
  try {
    const rows = await db
      .select({
        id: alertsTable.id,
        type: alertsTable.type,
        severity: alertsTable.severity,
        title: alertsTable.title,
        message: alertsTable.message,
        skuId: alertsTable.skuId,
        departmentId: alertsTable.departmentId,
        isResolved: alertsTable.isResolved,
        createdAt: alertsTable.createdAt,
        resolvedAt: alertsTable.resolvedAt,
        skuName: skusTable.name,
        departmentName: departmentsTable.name,
      })
      .from(alertsTable)
      .leftJoin(skusTable, eq(alertsTable.skuId, skusTable.id))
      .leftJoin(departmentsTable, eq(alertsTable.departmentId, departmentsTable.id))
      .orderBy(sql`${alertsTable.createdAt} desc`);

    let result = rows.map((r) => ({
      id: r.id,
      type: r.type,
      severity: r.severity,
      title: r.title,
      message: r.message,
      skuId: r.skuId,
      skuName: r.skuName ?? null,
      departmentId: r.departmentId,
      departmentName: r.departmentName ?? null,
      isResolved: r.isResolved,
      createdAt: r.createdAt,
      resolvedAt: r.resolvedAt ?? null,
    }));

    if (req.query.type) result = result.filter((r) => r.type === req.query.type);
    if (req.query.severity) result = result.filter((r) => r.severity === req.query.severity);
    if (req.query.resolved !== undefined) {
      const resolved = req.query.resolved === "true";
      result = result.filter((r) => r.isResolved === resolved);
    }

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Error listing alerts");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/alerts/:id/resolve", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const [updated] = await db
      .update(alertsTable)
      .set({ isResolved: true, resolvedAt: new Date() })
      .where(eq(alertsTable.id, id))
      .returning();
    if (!updated) return res.status(404).json({ error: "Not found" });

    const skuName = updated.skuId
      ? (await db.select({ name: skusTable.name }).from(skusTable).where(eq(skusTable.id, updated.skuId)))[0]?.name ?? null
      : null;
    const deptName = updated.departmentId
      ? (await db.select({ name: departmentsTable.name }).from(departmentsTable).where(eq(departmentsTable.id, updated.departmentId)))[0]?.name ?? null
      : null;

    res.json({
      ...updated,
      skuName,
      departmentName: deptName,
      resolvedAt: updated.resolvedAt ?? null,
    });
  } catch (err) {
    req.log.error({ err }, "Error resolving alert");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
