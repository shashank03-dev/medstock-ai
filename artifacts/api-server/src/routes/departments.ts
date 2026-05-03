import { Router } from "express";
import { db } from "@workspace/db";
import { departmentsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { CreateDepartmentBody } from "@workspace/api-zod";

const router = Router();

router.get("/departments", async (req, res) => {
  try {
    const departments = await db.select().from(departmentsTable).orderBy(departmentsTable.name);
    res.json(departments);
  } catch (err) {
    req.log.error({ err }, "Error listing departments");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/departments", async (req, res) => {
  try {
    const body = CreateDepartmentBody.parse(req.body);
    const [dept] = await db.insert(departmentsTable).values(body).returning();
    res.status(201).json(dept);
  } catch (err) {
    req.log.error({ err }, "Error creating department");
    res.status(400).json({ error: "Invalid request" });
  }
});

router.get("/departments/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const [dept] = await db.select().from(departmentsTable).where(eq(departmentsTable.id, id));
    if (!dept) return res.status(404).json({ error: "Not found" });
    res.json(dept);
  } catch (err) {
    req.log.error({ err }, "Error getting department");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
