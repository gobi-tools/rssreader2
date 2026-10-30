import { Context, Hono } from "hono";
import { requireAuth, type AuthedEnv } from "../middleware/session.js";
import { listFeeds } from "../feeds.js";
import r from '../frontend/react-srv.js';
import AddSection from "../frontend/pages/AddSection.js";
import { createSection, deleteSection, getSection, SectionError, updateSection } from "../sections.js";
import { error } from "console";
import { listSectionItems, markItemsInSectionAsRead } from "../items.js";
import Section from "../frontend/pages/Section.js";
import DeleteSection from "../frontend/pages/confirm/DeleteSection.js";
import ReadSection from "../frontend/pages/confirm/ReadSection.js";

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
  .get("/:id/edit", requireAuth, async (c) => {
    const id = c.req.param("id");
    const found = getSection(c.var.user.id, id);
    if (!found) return c.notFound();
    const feeds = await listFeeds(c.var.user.id);
    const props = {
      id,
      heading: 'Edit section',
      action: `/sections/${id}`,
      isEditing: true,
      name: found.name,
      feeds,
      checked: found.checked
    };
    return c.html(r.render(AddSection, props));
  })
  .post("/:id", requireAuth, async (c) => {
    const id = c.req.param("id");
    const { name, checked } = await readForm(c);
    try {
      if (!updateSection(c.var.user.id, id, name, checked)) return c.notFound();
    } catch (error) {
      if (!(error instanceof SectionError)) throw error;
      const feeds = await listFeeds(c.var.user.id);
      const props = {
        id,
        heading: 'Edit section',
        action: `/sections/${id}`,
        isEditing: true,
        name,
        feeds,
        checked,
        formError: error.message,
      };
      return c.html(r.render(AddSection, props), 422);
    }
    return c.redirect(`/sections/${id}`);
  })
  .get("/:id/delete", requireAuth, (c) => {
    const sectionId = c.req.param("id");
    return c.html(r.render(DeleteSection, { sectionId }));
  })
  .post("/:id/delete", requireAuth, (c) => {
    if (!deleteSection(c.var.user.id, c.req.param("id"))) return c.notFound();
    return c.redirect("/home");
  })
  .get("/:id/read", requireAuth, (c) => {
    const sectionId = c.req.param("id");
    return c.html(r.render(ReadSection, { sectionId }));
  })
  .post("/:id/read", requireAuth, (c) => {
    const found = getSection(c.var.user.id, c.req.param("id"));
    if (!found) return c.notFound();
    markItemsInSectionAsRead(c.var.user.id, found.id);
    return  c.redirect(`/sections/${found.id}`);
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
    return c.html(r.render(Section, { section: { id: found.id, name: found.name }, items }));
  });