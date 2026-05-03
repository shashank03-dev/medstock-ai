import { pgTable, serial, integer, real, text, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { hospitalsTable } from "./hospitals";

export const surplusListingsTable = pgTable("surplus_listings", {
  id: serial("id").primaryKey(),
  hospitalId: integer("hospital_id").notNull().references(() => hospitalsTable.id),
  skuName: text("sku_name").notNull(),
  category: text("category").notNull(),
  quantity: real("quantity").notNull(),
  unit: text("unit").notNull(),
  expiryDate: date("expiry_date"),
  pricePerUnit: real("price_per_unit"),
  notes: text("notes"),
  validUntil: date("valid_until").notNull(),
  status: text("status", { enum: ["available", "matched", "fulfilled", "expired"] })
    .notNull()
    .default("available"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertSurplusListingSchema = createInsertSchema(surplusListingsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertSurplusListing = z.infer<typeof insertSurplusListingSchema>;
export type SurplusListing = typeof surplusListingsTable.$inferSelect;
