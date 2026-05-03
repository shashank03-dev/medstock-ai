import { pgTable, serial, integer, real, boolean, text, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { skusTable } from "./skus";

export const forecastsTable = pgTable("forecasts", {
  id: serial("id").primaryKey(),
  skuId: integer("sku_id").notNull().references(() => skusTable.id),
  horizon: integer("horizon").notNull(), // 30, 60, 90
  predictedQuantity: real("predicted_quantity").notNull(),
  confidenceLow: real("confidence_low").notNull(),
  confidenceHigh: real("confidence_high").notNull(),
  isOverridden: boolean("is_overridden").notNull().default(false),
  overrideValue: real("override_value"),
  overrideReason: text("override_reason"),
  projectedStockoutDate: date("projected_stockout_date"),
  generatedAt: timestamp("generated_at").notNull().defaultNow(),
});

export const insertForecastSchema = createInsertSchema(forecastsTable).omit({ id: true, generatedAt: true });
export type InsertForecast = z.infer<typeof insertForecastSchema>;
export type Forecast = typeof forecastsTable.$inferSelect;
