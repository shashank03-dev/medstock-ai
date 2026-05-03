import { pgTable, serial, integer, boolean, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { skusTable } from "./skus";
import { departmentsTable } from "./departments";

export const alertsTable = pgTable("alerts", {
  id: serial("id").primaryKey(),
  type: text("type", { enum: ["low_stock", "expiry", "overstock", "forecast"] }).notNull(),
  severity: text("severity", { enum: ["critical", "warning", "info"] }).notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  skuId: integer("sku_id").references(() => skusTable.id),
  departmentId: integer("department_id").references(() => departmentsTable.id),
  isResolved: boolean("is_resolved").notNull().default(false),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAlertSchema = createInsertSchema(alertsTable).omit({ id: true, createdAt: true });
export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type Alert = typeof alertsTable.$inferSelect;
