import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  date,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  department: varchar("department").notNull().default("未設定"),
  role: varchar("role").notNull().default("user"), // user or admin
  pointBalance: integer("point_balance").notNull().default(20),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Departments table
export const departments = pgTable("departments", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Transactions table for point transfers
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  receiverId: varchar("receiver_id").notNull().references(() => users.id),
  points: integer("points").notNull(),
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Daily sending limits tracking
export const dailyLimits = pgTable("daily_limits", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  date: date("date").notNull(),
  sendCount: integer("send_count").notNull().default(0),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  sentTransactions: many(transactions, { relationName: "sender" }),
  receivedTransactions: many(transactions, { relationName: "receiver" }),
  dailyLimits: many(dailyLimits),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  sender: one(users, {
    fields: [transactions.senderId],
    references: [users.id],
    relationName: "sender",
  }),
  receiver: one(users, {
    fields: [transactions.receiverId],
    references: [users.id],
    relationName: "receiver",
  }),
}));

export const dailyLimitsRelations = relations(dailyLimits, ({ one }) => ({
  user: one(users, {
    fields: [dailyLimits.userId],
    references: [users.id],
  }),
}));

// Zod schemas
export const insertUserSchema = createInsertSchema(users);
export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true, createdAt: true });
export const insertDepartmentSchema = createInsertSchema(departments).omit({ id: true, createdAt: true });

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type Department = typeof departments.$inferSelect;
export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;
export type DailyLimit = typeof dailyLimits.$inferSelect;

// Extended types for frontend
export type TransactionWithUsers = Transaction & {
  sender: User;
  receiver: User;
};

export type UserWithStats = User & {
  dailySentCount: number;
  monthlyReceived: number;
};
