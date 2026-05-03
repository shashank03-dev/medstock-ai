import { Router } from "express";
import { db } from "@workspace/db";
import { crisisRequestsTable, surplusListingsTable, hospitalsTable } from "@workspace/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { CreateSurplusListingBody, CreateCrisisRequestBody, UpdateCrisisRequestStatusBody, ToggleCrisisModeBody } from "@workspace/api-zod";

const router = Router();

/* ── Helper: get the current facility ID from DB (replaces hardcoded MY_HOSPITAL_ID = 1) */
async function getCurrentHospitalId(): Promise<number> {
  const [hospital] = await db
    .select({ id: hospitalsTable.id })
    .from(hospitalsTable)
    .where(eq(hospitalsTable.isCurrentFacility, true));
  if (!hospital) throw new Error("No current facility configured. Please set a facility as current first.");
  return hospital.id;
}

router.get("/crisis/surplus-listings", async (req, res) => {
  try {
    const rows = await db
      .select({
        id: surplusListingsTable.id,
        hospitalId: surplusListingsTable.hospitalId,
        skuName: surplusListingsTable.skuName,
        category: surplusListingsTable.category,
        quantity: surplusListingsTable.quantity,
        unit: surplusListingsTable.unit,
        expiryDate: surplusListingsTable.expiryDate,
        pricePerUnit: surplusListingsTable.pricePerUnit,
        notes: surplusListingsTable.notes,
        validUntil: surplusListingsTable.validUntil,
        status: surplusListingsTable.status,
        createdAt: surplusListingsTable.createdAt,
        hospitalName: hospitalsTable.name,
        hospitalLocation: hospitalsTable.location,
      })
      .from(surplusListingsTable)
      .leftJoin(hospitalsTable, eq(surplusListingsTable.hospitalId, hospitalsTable.id))
      .orderBy(sql`${surplusListingsTable.createdAt} desc`);

    res.json(
      rows.map((r) => ({
        ...r,
        hospitalName: r.hospitalName ?? "Unknown",
        hospitalLocation: r.hospitalLocation ?? "Unknown",
        expiryDate: r.expiryDate ?? null,
        pricePerUnit: r.pricePerUnit ?? null,
        notes: r.notes ?? null,
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Error listing surplus listings");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/crisis/surplus-listings", async (req, res) => {
  try {
    const hospitalId = await getCurrentHospitalId();
    const body = CreateSurplusListingBody.parse(req.body);
    const expiryDate = body.expiryDate ? body.expiryDate.toISOString().slice(0, 10) : null;
    const [listing] = await db
      .insert(surplusListingsTable)
      .values({
        ...body,
        hospitalId,
        expiryDate,
        pricePerUnit: body.pricePerUnit ?? null,
        notes: body.notes ?? null,
      })
      .returning();

    const [hospital] = await db.select().from(hospitalsTable).where(eq(hospitalsTable.id, hospitalId));
    res.status(201).json({
      ...listing,
      hospitalName: hospital?.name ?? "Unknown",
      hospitalLocation: hospital?.location ?? "Unknown",
      expiryDate: listing.expiryDate ?? null,
      pricePerUnit: listing.pricePerUnit ?? null,
      notes: listing.notes ?? null,
    });
  } catch (err) {
    req.log.error({ err }, "Error creating surplus listing");
    res.status(400).json({ error: "Invalid request" });
    return;
  }
});

router.get("/crisis/requests", async (req, res) => {
  try {
    const rows = await db
      .select({
        id: crisisRequestsTable.id,
        hospitalId: crisisRequestsTable.hospitalId,
        skuName: crisisRequestsTable.skuName,
        category: crisisRequestsTable.category,
        quantityNeeded: crisisRequestsTable.quantityNeeded,
        unit: crisisRequestsTable.unit,
        urgency: crisisRequestsTable.urgency,
        status: crisisRequestsTable.status,
        notes: crisisRequestsTable.notes,
        isPriority: crisisRequestsTable.isPriority,
        matchedSurplusId: crisisRequestsTable.matchedSurplusId,
        createdAt: crisisRequestsTable.createdAt,
        updatedAt: crisisRequestsTable.updatedAt,
        hospitalName: hospitalsTable.name,
        hospitalLocation: hospitalsTable.location,
      })
      .from(crisisRequestsTable)
      .leftJoin(hospitalsTable, eq(crisisRequestsTable.hospitalId, hospitalsTable.id))
      .orderBy(sql`${crisisRequestsTable.createdAt} desc`);

    res.json(
      rows.map((r) => ({
        ...r,
        hospitalName: r.hospitalName ?? "Unknown",
        hospitalLocation: r.hospitalLocation ?? "Unknown",
        notes: r.notes ?? null,
        matchedSurplusId: r.matchedSurplusId ?? null,
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Error listing crisis requests");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/crisis/requests", async (req, res) => {
  try {
    const hospitalId = await getCurrentHospitalId();
    const body = CreateCrisisRequestBody.parse(req.body);
    const [request] = await db
      .insert(crisisRequestsTable)
      .values({ ...body, hospitalId, notes: body.notes ?? null, isPriority: body.isPriority ?? false })
      .returning();

    const [hospital] = await db.select().from(hospitalsTable).where(eq(hospitalsTable.id, hospitalId));
    res.status(201).json({
      ...request,
      hospitalName: hospital?.name ?? "Unknown",
      hospitalLocation: hospital?.location ?? "Unknown",
      notes: request.notes ?? null,
      matchedSurplusId: request.matchedSurplusId ?? null,
    });
  } catch (err) {
    req.log.error({ err }, "Error creating crisis request");
    res.status(400).json({ error: "Invalid request" });
    return;
  }
});

router.post("/crisis/requests/:id/update-status", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const body = UpdateCrisisRequestStatusBody.parse(req.body);
    const [updated] = await db
      .update(crisisRequestsTable)
      .set({ status: body.status, updatedAt: new Date() })
      .where(eq(crisisRequestsTable.id, id))
      .returning();
    if (!updated) return res.status(404).json({ error: "Not found" });

    const [hospital] = await db.select().from(hospitalsTable).where(eq(hospitalsTable.id, updated.hospitalId));
    res.json({
      ...updated,
      hospitalName: hospital?.name ?? "Unknown",
      hospitalLocation: hospital?.location ?? "Unknown",
      notes: updated.notes ?? null,
      matchedSurplusId: updated.matchedSurplusId ?? null,
    });
  } catch (err) {
    req.log.error({ err }, "Error updating crisis request status");
    res.status(400).json({ error: "Invalid request" });
    return;
  }
});

router.get("/crisis/matches", async (req, res) => {
  try {
    const openRequests = await db
      .select({
        id: crisisRequestsTable.id,
        skuName: crisisRequestsTable.skuName,
        quantityNeeded: crisisRequestsTable.quantityNeeded,
        unit: crisisRequestsTable.unit,
        urgency: crisisRequestsTable.urgency,
        hospitalId: crisisRequestsTable.hospitalId,
        hospitalName: hospitalsTable.name,
      })
      .from(crisisRequestsTable)
      .leftJoin(hospitalsTable, eq(crisisRequestsTable.hospitalId, hospitalsTable.id))
      .where(eq(crisisRequestsTable.status, "open"));

    const availableListings = await db
      .select({
        id: surplusListingsTable.id,
        skuName: surplusListingsTable.skuName,
        quantity: surplusListingsTable.quantity,
        unit: surplusListingsTable.unit,
        hospitalId: surplusListingsTable.hospitalId,
        hospitalName: hospitalsTable.name,
      })
      .from(surplusListingsTable)
      .leftJoin(hospitalsTable, eq(surplusListingsTable.hospitalId, hospitalsTable.id))
      .where(eq(surplusListingsTable.status, "available"));

    const matches = [];
    for (const req_ of openRequests) {
      const match = availableListings.find(
        (l) => l.skuName.toLowerCase().includes(req_.skuName.toLowerCase().split(" ")[0]) && l.hospitalId !== req_.hospitalId
      );
      if (match) {
        matches.push({
          requestId: req_.id,
          surplusId: match.id,
          skuName: req_.skuName,
          requestingHospital: req_.hospitalName ?? "Unknown",
          supplyingHospital: match.hospitalName ?? "Unknown",
          quantityNeeded: req_.quantityNeeded,
          quantityAvailable: match.quantity,
          unit: req_.unit,
          matchScore: 0.88,
          urgency: req_.urgency,
        });
      }
    }

    res.json(matches);
  } catch (err) {
    req.log.error({ err }, "Error getting crisis matches");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/crisis/mode", async (req, res) => {
  try {
    const [hospital] = await db
      .select()
      .from(hospitalsTable)
      .where(eq(hospitalsTable.isCurrentFacility, true));

    res.json({
      active: hospital?.crisisMode ?? false,
      activatedAt: hospital?.crisisModeActivatedAt ?? null,
      activatedBy: hospital?.crisisModeActivatedBy ?? null,
      reason: hospital?.crisisModeReason ?? null,
    });
  } catch (err) {
    req.log.error({ err }, "Error getting crisis mode");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/crisis/mode", async (req, res) => {
  try {
    const body = ToggleCrisisModeBody.parse(req.body);
    const [updated] = await db
      .update(hospitalsTable)
      .set({
        crisisMode: body.active,
        crisisModeActivatedAt: body.active ? new Date() : null,
        crisisModeActivatedBy: body.active ? "Admin" : null,
        crisisModeReason: body.active ? (body.reason ?? null) : null,
        updatedAt: new Date(),
      })
      .where(eq(hospitalsTable.isCurrentFacility, true))
      .returning();

    res.json({
      active: updated?.crisisMode ?? false,
      activatedAt: updated?.crisisModeActivatedAt ?? null,
      activatedBy: updated?.crisisModeActivatedBy ?? null,
      reason: updated?.crisisModeReason ?? null,
    });
  } catch (err) {
    req.log.error({ err }, "Error toggling crisis mode");
    res.status(400).json({ error: "Invalid request" });
  }
});

export default router;
