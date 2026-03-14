import { pgTable, text, varchar, timestamp, boolean, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

// Enums matching Supabase schema
export const studioStatusEnum = pgEnum("studio_status", [
  "active",
  "acquired",
  "bankrupt",
  "missing",
  "hibernating"
]);

export const gameStatusEnum = pgEnum("game_status", [
  "prototype",
  "in_development",
  "early_access",
  "released",
  "canceled",
  "legendary"
]);

export const postTypeEnum = pgEnum("post_type", [
  "devlog",
  "patch_notes",
  "announcement",
  "apology",
  "cancellation",
  "postmortem"
]);

// Project fate - what happened to the game
export const projectFateEnum = pgEnum("project_fate", [
  "in_progress",
  "released",
  "development_hell",
  "graveyard"
]);

// Studios table
export const studios = pgTable("studios", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ownerId: varchar("owner_id"),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  bio: text("bio"),
  foundingYear: integer("founding_year"),
  status: text("status").default("active"),
  logoUrl: text("logo_url"),
  bannerUrl: text("banner_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertStudioSchema = createInsertSchema(studios).omit({
  id: true,
  createdAt: true,
});

export type InsertStudio = z.infer<typeof insertStudioSchema>;
export type Studio = typeof studios.$inferSelect;

// Games table
export const games = pgTable("games", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studioId: varchar("studio_id").notNull(),
  title: text("title").notNull(),
  slug: text("slug").notNull(),
  tagline: text("tagline"),
  genre: text("genre"),
  platforms: text("platforms").array(),
  releaseYear: integer("release_year"),
  status: text("status").default("in_development"),
  description: text("description"),
  coverUrl: text("cover_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertGameSchema = createInsertSchema(games).omit({
  id: true,
  createdAt: true,
});

export type InsertGame = z.infer<typeof insertGameSchema>;
export type Game = typeof games.$inferSelect;

// Posts table
export const posts = pgTable("posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  gameId: varchar("game_id"),
  studioId: varchar("studio_id"),
  authorId: varchar("author_id"),
  type: text("type").default("devlog"),
  title: text("title").notNull(),
  version: text("version"),
  bodyMd: text("body_md"),
  excerpt: text("excerpt"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  createdAt: true,
});

export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof posts.$inferSelect;

// Projects - user's game creation projects
export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  tagline: text("tagline"),
  genre: text("genre"),
  fate: text("fate").default("in_progress"),
  currentStep: text("current_step").default("sprite"),
  releasedAt: timestamp("released_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  releasedAt: true,
});

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

// Sprites - pixel art for projects
export const sprites = pgTable("sprites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  name: text("name").notNull(),
  width: integer("width").notNull().default(16),
  height: integer("height").notNull().default(16),
  pixelData: text("pixel_data").notNull(),
  palette: text("palette").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSpriteSchema = createInsertSchema(sprites).omit({
  id: true,
  createdAt: true,
});

export type InsertSprite = z.infer<typeof insertSpriteSchema>;
export type Sprite = typeof sprites.$inferSelect;

// Characters - game characters for projects
export const characters = pgTable("characters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  name: text("name").notNull(),
  role: text("role"),
  archetype: text("archetype"),
  backstory: text("backstory"),
  traits: text("traits").array(),
  catchphrase: text("catchphrase"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCharacterSchema = createInsertSchema(characters).omit({
  id: true,
  createdAt: true,
});

export type InsertCharacter = z.infer<typeof insertCharacterSchema>;
export type Character = typeof characters.$inferSelect;

// Worlds - worldbuilding for projects
export const worlds = pgTable("worlds", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  setting: text("setting"),
  lore: text("lore"),
  mechanics: text("mechanics"),
  inspirations: text("inspirations").array(),
  tone: text("tone"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertWorldSchema = createInsertSchema(worlds).omit({
  id: true,
  createdAt: true,
});

export type InsertWorld = z.infer<typeof insertWorldSchema>;
export type World = typeof worlds.$inferSelect;

// Tags table
export const tags = pgTable("tags", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
});

export const insertTagSchema = createInsertSchema(tags).omit({
  id: true,
});

export type InsertTag = z.infer<typeof insertTagSchema>;
export type Tag = typeof tags.$inferSelect;

// Post tags junction table
export const postTags = pgTable("post_tags", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").notNull(),
  tagId: varchar("tag_id").notNull(),
});

export const insertPostTagSchema = createInsertSchema(postTags).omit({
  id: true,
});

export type InsertPostTag = z.infer<typeof insertPostTagSchema>;
export type PostTag = typeof postTags.$inferSelect;

// Extended types for API responses
export type StudioWithGames = Studio & {
  games: Game[];
};

export type GameWithStudio = Game & {
  studio: Studio;
};

export type PostWithRelations = Post & {
  game?: Game | null;
  studio?: Studio | null;
  tags?: Tag[];
};

export type ProjectWithAssets = Project & {
  sprites: Sprite[];
  characters: Character[];
  world: World | null;
};

// Query history for the SQL editor
export const queryHistory = pgTable("query_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  query: text("query").notNull(),
  executedAt: timestamp("executed_at").defaultNow().notNull(),
  success: boolean("success").notNull().default(true),
  errorMessage: text("error_message"),
  rowCount: text("row_count"),
});

export const insertQueryHistorySchema = createInsertSchema(queryHistory).omit({
  id: true,
  executedAt: true,
});

export type InsertQueryHistory = z.infer<typeof insertQueryHistorySchema>;
export type QueryHistory = typeof queryHistory.$inferSelect;

// Types for SQL execution
export interface SqlExecuteRequest {
  query: string;
}

export interface SqlExecuteResult {
  success: boolean;
  rows?: Record<string, unknown>[];
  columns?: string[];
  rowCount?: number;
  error?: string;
  executionTime?: number;
}

export interface TableSchema {
  tableName: string;
  columns: {
    name: string;
    type: string;
    nullable: boolean;
    isPrimaryKey: boolean;
  }[];
}

// Keep users table for compatibility
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
