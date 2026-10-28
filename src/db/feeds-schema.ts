import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

const id = () => text("id").primaryKey().$defaultFn(() => crypto.randomUUID());
const createdAt = () => 
  integer("created_at", { mode: 'timestamp_ms' })
  .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
  .notNull();

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