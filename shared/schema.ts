import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: timestamp("date").notNull(),
  name: text("name").notNull(),
  car: text("car"),
  depositor: text("depositor"),
  value: decimal("value", { precision: 12, scale: 2 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("pending-ledger"),
  confidence: integer("confidence"),
  source: varchar("source", { length: 100 }),
  paymentMethod: text("payment_method"),
  matchedTransactionId: varchar("matched_transaction_id"),
  sheetOrder: integer("sheet_order"), // Order in the original spreadsheet (row number)
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const googleSheetsConnections = pgTable("google_sheets_connections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  apiKey: text("api_key").notNull(),
  sheetUrl: text("sheet_url").notNull(),
  sheetId: text("sheet_id"),
  lastImportDate: timestamp("last_import_date"),
  lastImportCount: integer("last_import_count"),
  status: varchar("status", { length: 50 }).default("connected"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export const insertGoogleSheetsConnectionSchema = createInsertSchema(googleSheetsConnections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type GoogleSheetsConnection = typeof googleSheetsConnections.$inferSelect;
export type InsertGoogleSheetsConnection = z.infer<typeof insertGoogleSheetsConnectionSchema>;
