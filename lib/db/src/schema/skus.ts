import { pgTable, serial, text, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { departmentsTable } from "./departments";

export const skusTable = pgTable("skus", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  unit: text("unit").notNull(),
  unitCost: real("unit_cost").notNull().default(0),
  supplier: text("supplier"),
  departmentId: integer("department_id").notNull().references(() => departmentsTable.id),
  currentStock: real("current_stock").notNull().default(0),
  reorderPoint: real("reorder_point").notNull().default(0),
  safetyStock: real("safety_stock").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertSkuSchema = createInsertSchema(skusTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertSku = z.infer<typeof insertSkuSchema>;
export type Sku = typeof skusTable.$inferSelect;
