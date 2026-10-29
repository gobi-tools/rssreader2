import { Hono } from "hono";
import { requireAuth, type AuthedEnv } from "../middleware/session.js";
import { openItem } from "../items.js";

export const itemsRoute = new Hono<AuthedEnv>()
  .get("/:id/open", requireAuth, async (c) => {
    const url = openItem(c.var.user.id, c.req.param("id"));
    if (!url) return c.notFound();
    return c.redirect(url);
  });