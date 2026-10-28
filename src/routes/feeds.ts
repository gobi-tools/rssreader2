import { Hono } from "hono";
import { type AuthedEnv, requireAuth } from "../middleware/session.js";
import { FeedError, listFeeds, subscribe } from "../feeds.js";
import r from '../frontend/react-srv.js';
import Feeds from "../frontend/pages/Feeds.js";
import AddFeed from "../frontend/pages/AddFeed.js";

export const feedsRoutes = new Hono<AuthedEnv>()
  .get("/", requireAuth, async (c) => {
    const feeds = await listFeeds(c.var.user.id);
    return c.html(r.render(Feeds, { feeds }));
  })
  .get("/new", requireAuth, (c) => c.html(r.render(AddFeed, {})))
  .post('/', requireAuth, async (c) => {
    const { url } = await c.req.parseBody<Record<string, string>>();
    try {
      await subscribe(c.var.user.id, url?.trim() ?? '');
    } catch (error) {
      if (!(error instanceof FeedError)) throw error;
      return c.html(r.render(AddFeed, { url, formError: error.message}), 422);
    }
    return c.redirect("/feeds");
  });