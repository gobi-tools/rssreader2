import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, unique, primaryKey, index } from "drizzle-orm/sqlite-core";
import { user } from "./auth-schema.js";

const timestamp = (name: string) =>
  integer(name, { mode: "timestamp_ms" });

const timestampDefault = (name: string) =>
  timestamp(name)
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull();

const id = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());

const createdAt = () =>
  timestampDefault("created_at");

const userId = () =>
  text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' });

const feedId = () =>
  text("feed_id")
    .notNull()
    .references(() => feed.id, { onDelete: 'cascade' });

const sectionId = () =>
  text("section_id")
    .notNull()
    .references(() => section.id, { onDelete: 'cascade' });

const subscriptionid = () =>
  text("subscription_id")
    .notNull()
    .references(() => subscription.id, { onDelete: 'cascade' });

const itemId = () =>
  text("item_id")
    .notNull()
    .references(() => item.id, { onDelete: 'cascade' });

export const feed = sqliteTable("feed", {
  id: id(),
  url: text("url").notNull().unique(),
  title: text("title"),
  siteUrl: text("site_url"),
  author: text("author"),
  etag: text("etag"),
  lastModified: text("last_modified"),
  lastFetchedAt: timestamp("last_fetched_at"),
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

export const subscription = sqliteTable("subscription", {
  id: id(),
  userId: userId(),
  feedId: feedId(),
  createdAt: createdAt(),
},
  (table) => [unique("susbcription_userId_feedId_unique").on(table.userId, table.feedId)]
);

export const sectionFeed = sqliteTable("section_feed", {
  sectionId: sectionId(),
  subscriptionid: subscriptionid(),
},
  (table) => [primaryKey({ columns: [table.sectionId, table.subscriptionid] })],
);

export const item = sqliteTable("item", {
  id: id(),
  feedId: feedId(),
  guid: text("guid").notNull(),
  url: text("url").notNull(),
  title: text("title"),
  author: text("author"),
  publishedAt: timestamp("published_at"),
  createdAt: createdAt(),
},
  (table) => [
    unique("item_feedId_quid_unique").on(table.feedId, table.guid),
    index("item_feedId_publishedAt_idx").on(table.feedId, table.publishedAt),
  ],
);

export const itemRead = sqliteTable("item_read", {
  userId: userId(),
  itemId: itemId(),
  readAt: timestampDefault("read_at"),
},
  (table) => [primaryKey({ columns: [table.userId, table.itemId] })]
);