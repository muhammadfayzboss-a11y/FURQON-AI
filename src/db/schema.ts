import { pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  role: varchar("role", { length: 20 }).notNull(), // 'user' | 'assistant'
  content: text("content").notNull(),
  sessionId: varchar("session_id", { length: 64 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
