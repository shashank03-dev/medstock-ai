import { Router } from "express";
import { db } from "@workspace/db";
import { hospitalsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/hospitals", async (req, res) => {
  try {
    const hospitals = await db.select().from(hospitalsTable).orderBy(hospitalsTable.name);
    res.json(
      hospitals.map((h) => ({
        id: h.id,
        name: h.name,
        location: h.location,
        beds: h.beds,
        contactName: h.contactName,
        contactEmail: h.contactEmail,
        isCurrentFacility: h.isCurrentFacility,
        crisisMode: h.crisisMode,
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Error listing hospitals");
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ── PUT /api/hospitals/:id — update hospital profile & preferences ──────────── */
router.put("/hospitals/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid hospital ID" });

    const { name, location, beds, contactName, contactEmail } = req.body as {
      name?: string;
      location?: string;
      beds?: number;
      contactName?: string;
      contactEmail?: string;
    };

    if (!name?.trim() || !location?.trim()) {
      return res.status(400).json({ error: "Name and location are required" });
    }

    const [updated] = await db
      .update(hospitalsTable)
      .set({
        name: name.trim(),
        location: location.trim(),
        beds: Number(beds) || 0,
        contactName: contactName?.trim() || null,
        contactEmail: contactEmail?.trim() || null,
        updatedAt: new Date(),
      })
      .where(eq(hospitalsTable.id, id))
      .returning();

    if (!updated) return res.status(404).json({ error: "Hospital not found" });

    res.json({
      id: updated.id,
      name: updated.name,
      location: updated.location,
      beds: updated.beds,
      contactName: updated.contactName,
      contactEmail: updated.contactEmail,
      isCurrentFacility: updated.isCurrentFacility,
      crisisMode: updated.crisisMode,
    });
  } catch (err) {
    req.log.error({ err }, "Error updating hospital");
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ── PUT /api/hospitals/:id/set-current — switch active hospital ────────────── */
router.put("/hospitals/:id/set-current", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid hospital ID" });

    await db.update(hospitalsTable).set({ isCurrentFacility: false, updatedAt: new Date() });
    const [updated] = await db
      .update(hospitalsTable)
      .set({ isCurrentFacility: true, updatedAt: new Date() })
      .where(eq(hospitalsTable.id, id))
      .returning();

    if (!updated) return res.status(404).json({ error: "Hospital not found" });
    res.json({ success: true, id: updated.id, name: updated.name });
  } catch (err) {
    req.log.error({ err }, "Error setting current hospital");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
