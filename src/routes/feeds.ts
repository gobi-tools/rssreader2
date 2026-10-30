import { Hono } from "hono";
import { type AuthedEnv, requireAuth } from "../middleware/session.js";
import { deleteSubscribedFeed, FeedError, getSubscribedFeed, listFeedItems, listFeeds, subscribe } from "../feeds.js";
import r from '../frontend/react-srv.js';
import Feeds from "../frontend/pages/Feeds.js";
import AddFeed from "../frontend/pages/AddFeed.js";
import Feed from "../frontend/pages/Feed.js";
import DeleteSubsctiption from "../frontend/pages/confirm/DeleteSubscription.js";
import ReadSubscription from "../frontend/pages/confirm/ReadSubscription.js";
import { markItemsInSubsctiptionAsRead } from "../items.js";

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
      return c.html(r.render(AddFeed, { url, formError: error.message }), 422);
    }
    return c.redirect("/feeds");
  })
  .get("/subscription/:subscriptionId", requireAuth, (c) => {
    const subscriptionId = c.req.param("subscriptionId");
    const feed = getSubscribedFeed(subscriptionId, c.var.user.id);
    if (!feed) return c.notFound();

    const feedItems = listFeedItems(feed.id, c.var.user.id);
    const items = feedItems.map(({ readAt, date, ...i }) => ({
      ...i,
      date: date.toISOString(),
      read: readAt !== null,
    }));
    const props = {
      feed: {
        title: feed.title,
        url: feed.url,
        siteUrl: feed.siteUrl,
        subscriptionId: feed.subscriptionId,
      },
      items,
    };
    return c.html(r.render(Feed, props));
  })
  .get("/subscription/:subscriptionId/read", requireAuth, (c) => {
    const subscriptionId = c.req.param("subscriptionId");
    return c.html(r.render(ReadSubscription, { subscriptionId }));
  })
  .post("/subscription/:subscriptionId/read", requireAuth, (c) => {
    const subscriptionId = c.req.param("subscriptionId");
    const found = getSubscribedFeed(subscriptionId, c.var.user.id);
    if (!found) return c.notFound();
    markItemsInSubsctiptionAsRead(c.var.user.id, subscriptionId);
    return c.redirect(`/feeds/subscription/${subscriptionId}`)
  })
  .get("/subscription/:subscriptionId/delete", requireAuth, (c) => {
    const subscriptionId = c.req.param("subscriptionId");
    return c.html(r.render(DeleteSubsctiption, { subscriptionId })); 
  })
  .post("/subscription/:subscriptionId/delete", requireAuth, (c) => {
    if (!deleteSubscribedFeed(c.req.param("subscriptionId"), c.var.user.id)) return c.notFound();
    return c.redirect("/feeds");
  });