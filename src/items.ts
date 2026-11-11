import { desc, sql, eq, and, or, lte, isNull } from "drizzle-orm";
import { feed, item, itemRead, sectionFeed, subscription } from "./db/feeds-schema.js";
import { db } from "./db/index.js";

export function listSectionItems(userId: string, sectionId: string, perFeed = 30, readCap = 20) {
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

  const rankedCte = db.$with("ranked").as(ranked);

  // Second layer: apply the per-feed cap, then rank the surviving read items
  // across the whole section by recency. Ranking AFTER the per-feed filter
  // matters — otherwise one chatty feed's excess read items would occupy the
  // global slots and starve other feeds' history. Unread goes into its own
  // partition here (its rank is never used; it's exempt below).
  const cappedCte = db.$with("capped").as(
    db
      .select({
        id: rankedCte.id,
        title: rankedCte.title,
        url: rankedCte.url,
        date: rankedCte.date,
        feedTitle: rankedCte.feedTitle,
        readAt: rankedCte.readAt,
        readRank: sql<number>`row_number() over (partition by ${rankedCte.readAt} is null order by ${rankedCte.date} desc)`.as("read_rank"),
      })
      .from(rankedCte)
      .where(or(lte(rankedCte.rank, perFeed), isNull(rankedCte.readAt)))
  );

  return db
    .with(rankedCte, cappedCte)
    .select({ id: cappedCte.id, title: cappedCte.title, url: cappedCte.url, date: cappedCte.date, feedTitle: cappedCte.feedTitle, readAt: cappedCte.readAt })
    .from(cappedCte)
    // Unread is exempt from both caps: the list must contain every unread
    // item, or the count derived from it (Section.tsx) drifts from
    // unreadCount (home) and the missing ones can never be clicked to zero.
    // Read history is bounded instead — at most perFeed per feed (chatty
    // guard) and at most readCap overall, so the payload stays independent of
    // section age and feed count. Still no date-ordered LIMIT: that's exactly
    // what used to hide older unread items (the "62 vs 48" bug).
    .where(or(isNull(cappedCte.readAt), lte(cappedCte.readRank, readCap)))
    .orderBy(desc(cappedCte.date))
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