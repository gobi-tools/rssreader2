import { and, asc, eq, inArray, ne } from "drizzle-orm";
import { section, sectionFeed, subscription } from "./db/feeds-schema.js";
import { db } from "./db/index.js";

export class SectionError extends Error {};

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

export function listSections(userId: string) {
  return db
    .select({ id: section.id, name: section.name })
    .from(section)
    .where(eq(section.userId, userId))
    .orderBy(asc(section.name));
}

export function getSection(userId: string, id: string) {
  const row = db 
    .select()
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