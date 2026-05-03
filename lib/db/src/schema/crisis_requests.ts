import { pgTable, serial, integer, real, boolean, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { hospitalsTable } from "./hospitals";
import { surplusListingsTable } from "./surplus_listings";

export const crisisRequestsTable = pgTable("crisis_requests", {
  id: serial("id").primaryKey(),
  hospitalId: integer("hospital_id").notNull().references(() => hospitalsTable.id),
  skuName: text("sku_name").notNull(),
  category: text("category").notNull(),
  quantityNeeded: real("quantity_needed").notNull(),
  unit: text("unit").notNull(),
  urgency: text("urgency", { enum: ["critical", "high", "medium"] }).notNull(),
  status: text("status", {
    enum: ["open", "matched", "confirmed", "transfer_acknowledged", "closed"],
  })
    .notNull()
    .default("open"),
  notes: text("notes"),
  isPriority: boolean("is_priority").notNull().default(false),
  matchedSurplusId: integer("matched_surplus_id").references(() => surplusListingsTable.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertCrisisRequestSchema = createInsertSchema(crisisRequestsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCrisisRequest = z.infer<typeof insertCrisisRequestSchema>;
export type CrisisRequest = typeof crisisRequestsTable.$inferSelect;
