import { desc, sql, eq, and, or, lte, isNull } from "drizzle-orm";
import { feed, item, itemRead, sectionFeed, subscription } from "./db/feeds-schema.js";
import { db } from "./db/index.js";

export function listSectionItems(userId: string, sectionId: string, readPerFeed = 10) {
  const date = sql<number>`coalesce(${item.publishedAt}, ${item.createdAt})`;
  // Read items ranked among their own feed's read items; unread lands in a
  // separate partition whose rank is never consulted (it's exempt from caps).
  const readRank = sql<number>`row_number() over (partition by ${item}.feed_id, ${itemRead.readAt} is not null order by ${date} desc)`.as("read_rank");

  const ranked = db
    .select({
      id: item.id,
      title: item.title,
      url: item.url,
      date: date.mapWith(item.publishedAt).as("date"),
      feedTitle: sql<string | null>`${feed.title}`.as("feed_title"),
      readAt: itemRead.readAt,
      readRank,
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
    // Every unread item must be present: Section.tsx derives its count from
    // this list, so it has to match unreadCount on home (the "62 vs 48" bug
    // otherwise) and every unread must be reachable to click to zero. Read
    // history is bounded per feed instead of globally — each feed keeps its
    // readPerFeed most recent reads, so no feed can starve the others and the
    // payload grows with feed count (feeds * readPerFeed), never with section
    // age. Still no date-ordered LIMIT: that's what used to hide older unread.
    .where(or(isNull(cte.readAt), lte(cte.readRank, readPerFeed)))
    .orderBy(desc(cte.date))
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