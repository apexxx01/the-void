import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const diaryEntriesTable = pgTable("diary_entries", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  encryptedContent: text("encrypted_content").notNull(),
  mood: text("mood"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const diaryUsersTable = pgTable("diary_users", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDiaryEntrySchema = createInsertSchema(diaryEntriesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertDiaryEntry = z.infer<typeof insertDiaryEntrySchema>;
export type DiaryEntry = typeof diaryEntriesTable.$inferSelect;
export type DiaryUser = typeof diaryUsersTable.$inferSelect;
