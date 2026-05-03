import { pgTable, serial, integer, real, text, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { skusTable } from "./skus";

export const expiryBatchesTable = pgTable("expiry_batches", {
  id: serial("id").primaryKey(),
  skuId: integer("sku_id").notNull().references(() => skusTable.id),
  batchNumber: text("batch_number").notNull(),
  expiryDate: date("expiry_date").notNull(),
  quantity: real("quantity").notNull(),
  supplier: text("supplier"),
  status: text("status", { enum: ["active", "resolved_returned", "resolved_donated", "expired"] })
    .notNull()
    .default("active"),
  resolvedAt: timestamp("resolved_at"),
  resolvedNotes: text("resolved_notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertExpiryBatchSchema = createInsertSchema(expiryBatchesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertExpiryBatch = z.infer<typeof insertExpiryBatchSchema>;
export type ExpiryBatch = typeof expiryBatchesTable.$inferSelect;
