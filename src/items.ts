import { desc, sql, eq, and, lte } from "drizzle-orm";
import { feed, item, itemRead, sectionFeed, subscription } from "./db/feeds-schema.js";
import { db } from "./db/index.js";

export function listSectionItems(userId: string, sectionId: string, limit = 100, perFeed = 30) {
  const date = sql<number>`coalesce(${item.publishedAt}, ${item.createdAt})`;
  const rank = sql<number>`row_number() over (partition by ${item}.feed_id order by ${date} desc)`.as("rank");

  const ranked = db
    .select({
      id: item.id,
      title: item.title,
      url: item.url,
      date: date.mapWith(item.publishedAt).as("date"),
      feedTitle: sql<string | null>`${feed.title}`.as("feed_title"),
      readAt: itemRead.readAt,
      rank,
    })
    .from(sectionFeed)
    .innerJoin(subscription, eq(subscription.id, sectionFeed.subscriptionId))
    .innerJoin(item, eq(item.feedId, subscription.feedId))
    .innerJoin(feed, eq(feed.id, item.feedId))
    .leftJoin(itemRead, and(eq(itemRead.itemId, item.id), eq(itemRead.userId, userId)))
    .where(eq(sectionFeed.sectionId, sectionId));

  const cte = db.$with("ranked").as(ranked);
  return db
    .with(cte)
    .select({ id: cte.id, title: cte.title, url: cte.url, date: cte.date, feedTitle: cte.feedTitle, readAt: cte.readAt })
    .from(cte)
    .where(lte(cte.rank, perFeed))
    .orderBy(desc(cte.date))
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

export function markItemsInSectionAsRead(userId: string, sectionId: string) {
  const items = db 
    .select({
      userId: sql<string>`${userId}`.as("user_id"),
      itemId: item.id,
      readAt: sql<Date>`${Date.now()}`.as("read_at")
    })
    .from(sectionFeed)
    .innerJoin(subscription, eq(subscription.id, sectionFeed.subscriptionId))
    .innerJoin(item, eq(item.feedId, subscription.feedId))
    .where(eq(sectionFeed.sectionId, sectionId));
  return db.insert(itemRead).select(items).onConflictDoNothing().run().changes;
}

export function markItemsInSubsctiptionAsRead(userId: string, subscriptionId: string) {
  const items = db 
    .select({
      userId: sql<string>`${userId}`.as("user_id"),
      itemId: item.id,
      readAt: sql<Date>`${Date.now()}`.as("read_at")
    })
    .from(subscription)
    .innerJoin(item, eq(item.feedId, subscription.feedId))
    .where(eq(subscription.id, subscriptionId));
  return db.insert(itemRead).select(items).onConflictDoNothing().run().changes;
}