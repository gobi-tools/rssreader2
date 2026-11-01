import { and, asc, eq, inArray, ne, sql } from "drizzle-orm";
import { item, itemRead, section, sectionFeed, subscription } from "./db/feeds-schema.js";
import { db } from "./db/index.js";

export class SectionError extends Error {};

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

/**
 * Scalar subquery: unread items for the section of the current FROM row.
 * Unread = no item_read row for this user. All lookups are index seeks
 * (section_feed PK leads with section_id, item_feedId, item_read PK).
 *
 * Column names are written as literal text on purpose: drizzle serializes
 * Column objects interpolated into a sql template WITHOUT their table
 * qualifier ("id" instead of "subscription"."id"), which is ambiguous as
 * soon as several joined tables expose the same column name.
 */
const unreadCount = (userId: string) => sql<number>`(
  select count(*)
  from ${sectionFeed} sf
  inner join ${subscription} sub on sub.id = sf.subscription_id
  inner join ${item} i on i.feed_id = sub.feed_id
  left join ${itemRead} ir on ir.item_id = i.id and ir.user_id = ${userId}
  where sf.section_id = ${section}.id
    and sub.user_id = ${userId}
    and ir.item_id is null
)`;

export function listSections(userId: string) {
  return db
    .select({ id: section.id, name: section.name, unread: unreadCount(userId) })
    .from(section)
    .where(eq(section.userId, userId))
    .orderBy(asc(section.name));
}

export function getSection(userId: string, id: string) {
  const row = db 
    .select({
      id: section.id,
      userId: section.userId,
      name: section.name,
      createdAt: section.createdAt,
      unread: unreadCount(userId),
    })
    .from(section)
    .where(and(eq(section.id, id), eq(section.userId, userId)))
    .get();
  if (!row) return null;

  const checked = db 
    .select({ id: sectionFeed.subscriptionId })
    .from(sectionFeed)
    .where(eq(sectionFeed.sectionId, id))
    .all()
    .map((r) => r.id);
  return { ...row, checked };
}

export function createSection(userId: string, name: string, subscriptionIds: string[]) {
  return db.transaction((tx) => {
    name = checkName(tx, userId, name);
    const row = tx
      .insert(section)
      .values({ userId, name })
      .returning()
      .get();
    setFeeds(tx, userId, row.id, subscriptionIds);
    return row;
  });
}

export function updateSection(userId: string, id: string, name: string, subscriptionIds: string[]) {
  return db.transaction((tx) => {
    name = checkName(tx, userId, name, id);
    const row = tx 
      .update(section)
      .set({ name })
      .where(and(eq(section.id, id), eq(section.userId, userId)))
      .returning()
      .get();

    if (!row) return null;
    setFeeds(tx, userId, id, subscriptionIds);
    return row;
  });
}

export function deleteSection(userId: string, id: string) {
  const { changes } = db 
    .delete(section)
    .where(and(eq(section.id, id), eq(section.userId, userId)))
    .run();
  return changes > 0;
}

function checkName(tx: Tx, userId: string, name: string, exceptId?: string) {
  name = name.trim();
  if (!name) throw new SectionError("Give a section a name");
  const taken = tx
    .select({ id: section.id })
    .from(section)
    .where(and(
      eq(section.userId, userId),
      eq(section.name, name),
      exceptId ? ne(section.id, exceptId) : undefined
    ))
    .get();
  if (taken) throw new SectionError("You already have a section called that");
  return name;
}

function setFeeds(tx: Tx, userId: string, sectionId: string, subscriptionIds: string[]) {
  tx
    .delete(sectionFeed)
    .where(eq(sectionFeed.sectionId, sectionId))
    .run();
  
  if (subscriptionIds.length === 0) return;
  
  const owned = tx
    .select({ id: subscription.id })
    .from(subscription)
    .where(and(eq(subscription.userId, userId), inArray(subscription.id, subscriptionIds)))
    .all();
  if (owned.length) {
    tx
      .insert(sectionFeed)
      .values(owned.map((s) => ({ sectionId, subscriptionId: s.id })))
      .run();
  }
}