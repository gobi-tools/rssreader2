import { Context, Hono } from "hono";
import { requireAuth, type AuthedEnv } from "../middleware/session.js";
import { listFeeds } from "../feeds.js";
import r from '../frontend/react-srv.js';
import AddSection from "../frontend/pages/AddSection.js";
import { createSection, getSection, SectionError } from "../sections.js";
import { error } from "console";
import { listSectionItems } from "../items.js";
import Section from "../frontend/pages/Section.js";

async function readForm(c: Context) {
  const body = await c.req.parseBody({ all: true });
  return {
    name: String(body.name ?? ''),
    checked: [body.subscriptionIds ?? []].flat().map(String),
  }
}

export const sectionsRoutes = new Hono<AuthedEnv>()
  .get("/new", requireAuth, async (c) => {
    const feeds = await listFeeds(c.var.user.id);
    return c.html(r.render(AddSection, { heading: "New section", action: "/sections", feeds }));
  })
  .post("/", requireAuth, async (c) => {
    const { name, checked } = await readForm(c);
    let created;
    try {
      created = createSection(c.var.user.id, name, checked);
    } catch (e) {
      if (!(error instanceof SectionError)) throw error;
      const feeds = await listFeeds(c.var.user.id);
      const props = {
        heading: "New section",
        action: "/sections",
        name,
        feeds,
        checked,
        formError: error.message,
      };
      return c.html(r.render(AddSection, props), 422);
    }
    return c.redirect(`/sections/${created.id}`);
  })
  // the reading view
  .get("/:id", requireAuth, (c) => {
    const found = getSection(c.var.user.id, c.req.param("id"));
    if (!found) return c.notFound();
    const sectionItems = listSectionItems(c.var.user.id, found.id);
    const items = sectionItems.map(({ readAt, date, ...i }) => ({
      ...i,
      date: date.toISOString(),
      read: readAt !== null,
    }));
    return c.html(r.render(Section, { section: { id: found.id, name: found.name}, items}));
  });