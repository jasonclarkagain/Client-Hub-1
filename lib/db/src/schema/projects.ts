import { pgTable, text, serial, timestamp, numeric, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const projectTypeEnum = pgEnum("project_type", [
  "logo",
  "branding",
  "web_design",
  "print",
  "illustration",
  "other",
]);

export const projectStatusEnum = pgEnum("project_status", [
  "pending",
  "in_progress",
  "review",
  "completed",
  "cancelled",
]);

export const projectsTable = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  clientName: text("client_name").notNull(),
  clientEmail: text("client_email").notNull(),
  projectType: projectTypeEnum("project_type").notNull().default("other"),
  description: text("description"),
  status: projectStatusEnum("status").notNull().default("pending"),
  budget: numeric("budget", { precision: 10, scale: 2 }),
  deadline: text("deadline"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertProjectSchema = createInsertSchema(projectsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projectsTable.$inferSelect;
