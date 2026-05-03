import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const hospitalsTable = pgTable("hospitals", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  beds: integer("beds").notNull().default(0),
  contactName: text("contact_name"),
  contactEmail: text("contact_email"),
  isCurrentFacility: boolean("is_current_facility").notNull().default(false),
  crisisMode: boolean("crisis_mode").notNull().default(false),
  crisisModeActivatedAt: timestamp("crisis_mode_activated_at"),
  crisisModeActivatedBy: text("crisis_mode_activated_by"),
  crisisModeReason: text("crisis_mode_reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertHospitalSchema = createInsertSchema(hospitalsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertHospital = z.infer<typeof insertHospitalSchema>;
export type Hospital = typeof hospitalsTable.$inferSelect;
