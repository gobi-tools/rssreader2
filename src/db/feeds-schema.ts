import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import { user } from "./auth-schema.js";

const id = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());

const createdAt = () =>
  integer("created_at", { mode: 'timestamp_ms' })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull();

const userId = () =>
  text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' })

export const feed = sqliteTable("feed", {
  id: id(),
  url: text("url").notNull().unique(),
  title: text("title"),
  siteUrl: text("site_url"),
  author: text("author"),
  etag: text("etag"),
  lastModified: text("last_modified"),
  lastFetchedAt: integer("last_fetched_at", { mode: "timestamp_ms" }),
  lastError: text("last_error"),
  createdAt: createdAt(),
});

export const section = sqliteTable("section", {
  id: id(),
  userId: userId(),
  name: text("name").notNull(),
  createdAt: createdAt()
},
  (table) => [unique("section_userId_name_unique").on(table.userId, table.name)],
);