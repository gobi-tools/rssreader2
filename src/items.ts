import { desc, sql, eq, and } from "drizzle-orm";
import { feed, item, itemRead, sectionFeed, subscription } from "./db/feeds-schema.js";
import { db } from "./db/index.js";

export function listSectionItems(userId: string, sectionId: string, limit = 100) {
  const date = sql<number>`coalesce(${item.publishedAt}, ${item.createdAt})`;
  return db
    .select({
      id: item.id,
      title: item.title,
      url: item.url,
      date: date.mapWith(item.publishedAt),
      feedTitle: item.title,
      readAt: itemRead.readAt,
    })
    .from(sectionFeed)
    .innerJoin(subscription, eq(subscription.id, sectionFeed.subscriptionid))
    .innerJoin(item, eq(item.feedId, subscription.feedId))
    .innerJoin(feed, eq(feed.id, item.feedId))
    .leftJoin(itemRead, and(eq(itemRead.itemId, item.id), eq(itemRead.userId, userId)))
    .where(eq(sectionFeed.sectionId, sectionId))
    .orderBy(desc(date))
    .limit(limit)
    .all();
}

export function openItem(userId: string, itemId: string) {
  const row = db
    .select({ url: item.url })
    .from(item)
    .innerJoin(subscription, and(eq(subscription.feedId, item.feedId), eq(subscription.userId, userId)))
    .where(eq(item.id, itemId))
    .get();
  if (!row) return null;
  db.insert(itemRead).values({ userId, itemId }).onConflictDoNothing().run();
  return row.url;
}