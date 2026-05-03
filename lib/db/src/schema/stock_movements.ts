import { pgTable, serial, integer, real, text, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { skusTable } from "./skus";

export const stockMovementsTable = pgTable("stock_movements", {
  id: serial("id").primaryKey(),
  skuId: integer("sku_id").notNull().references(() => skusTable.id),
  date: date("date").notNull(),
  type: text("type", { enum: ["receipt", "consumption", "adjustment"] }).notNull(),
  quantity: real("quantity").notNull(),
  runningTotal: real("running_total").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertStockMovementSchema = createInsertSchema(stockMovementsTable).omit({ id: true, createdAt: true });
export type InsertStockMovement = z.infer<typeof insertStockMovementSchema>;
export type StockMovement = typeof stockMovementsTable.$inferSelect;
