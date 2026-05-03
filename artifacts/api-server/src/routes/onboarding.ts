import { Router } from "express";
import { db } from "@workspace/db";
import { hospitalsTable, departmentsTable, skusTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const router = Router();

const OnboardingSchema = z.object({
  hospital: z.object({
    name: z.string().min(1),
    location: z.string().min(1),
    beds: z.number().int().positive(),
    contactName: z.string().optional(),
    contactEmail: z.string().optional(),
    specialization: z.string().optional(),
  }),
  departments: z.array(z.object({
    name: z.string().min(1),
    description: z.string().optional(),
  })).min(1),
  skus: z.array(z.object({
    name: z.string().min(1),
    category: z.string().min(1),
    unit: z.string().min(1),
    unitCost: z.number().min(0).default(0),
    supplier: z.string().optional(),
    departmentIndex: z.number().int().min(0).default(0),
    currentStock: z.number().min(0).default(0),
    reorderPoint: z.number().min(0).default(0),
    safetyStock: z.number().min(0).default(0),
  })).default([]),
  setAsCurrent: z.boolean().default(true),
});

router.post("/onboarding", async (req, res) => {
  try {
    const body = OnboardingSchema.parse(req.body);

    let result: { hospitalId: number; hospitalName: string; departmentsCreated: number; skusCreated: number } = {
      hospitalId: 0,
      hospitalName: "",
      departmentsCreated: 0,
      skusCreated: 0,
    };

    await db.transaction(async (tx) => {
      if (body.setAsCurrent) {
        await tx.update(hospitalsTable).set({ isCurrentFacility: false });
      }

      const [hospital] = await tx
        .insert(hospitalsTable)
        .values({
          name: body.hospital.name,
          location: body.hospital.location,
          beds: body.hospital.beds,
          contactName: body.hospital.contactName ?? null,
          contactEmail: body.hospital.contactEmail ?? null,
          isCurrentFacility: body.setAsCurrent,
        })
        .returning();

      const departments = await tx
        .insert(departmentsTable)
        .values(
          body.departments.map((d) => ({
            name: d.name,
            hospitalId: hospital.id,
            description: d.description ?? null,
          }))
        )
        .returning();

      if (body.skus.length > 0) {
        await tx.insert(skusTable).values(
          body.skus.map((sku) => ({
            name: sku.name,
            category: sku.category,
            unit: sku.unit,
            unitCost: sku.unitCost,
            supplier: sku.supplier ?? null,
            departmentId: departments[Math.min(sku.departmentIndex, departments.length - 1)]?.id ?? departments[0].id,
            currentStock: sku.currentStock,
            reorderPoint: sku.reorderPoint,
            safetyStock: sku.safetyStock,
          }))
        );
      }

      result = {
        hospitalId: hospital.id,
        hospitalName: hospital.name,
        departmentsCreated: departments.length,
        skusCreated: body.skus.length,
      };
    });

    res.status(201).json({ success: true, ...result });
  } catch (err: any) {
    if (err?.issues) {
      return res.status(400).json({ error: "Validation error", details: err.issues });
    }
    req.log.error({ err }, "Error in hospital onboarding");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/hospitals/:id/set-current", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid hospital ID" });

  try {
    await db.transaction(async (tx) => {
      await tx.update(hospitalsTable).set({ isCurrentFacility: false });
      const [hospital] = await tx
        .update(hospitalsTable)
        .set({ isCurrentFacility: true })
        .where(eq(hospitalsTable.id, id))
        .returning();

      if (!hospital) return res.status(404).json({ error: "Hospital not found" });

      res.json({
        success: true,
        hospital: { id: hospital.id, name: hospital.name, location: hospital.location, beds: hospital.beds },
      });
    });
  } catch (err) {
    req.log.error({ err }, "Error switching current facility");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
