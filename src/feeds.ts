import { parseFeed, type AnyFeed } from "feedsmith";

export type FeedItem = {
  guid: string;
  url: string;
  title: string | null;
  author: string | null;
  publishedAt: Date | null;
};

export type FetchedFeed = {
  format: "rss" | "atom" | "rdf" | "json",
  url: string;
  title: string | null;
  siteUrl: string | null;
  author: string | null;
  etag: string | null;
  lastModified: string | null;
  items: FeedItem[];
};

export class FeedError extends Error { };

const MAX_BYTES = 5_000_000;
const MAX_ITEMS = 50;

export async function fetchFeed(
  url: string,
  cache: {
    etag?: string | null,
    lastModified?: string | null,
  } = {},
): Promise<FetchedFeed | null> {
  if (!URL.canParse(url)) throw new FeedError("That doesn't look like a URL");

  const { protocol } = new URL(url);
  if (protocol !== "http:" && protocol !== "https:") throw new FeedError("Only http(s) URLs are supported");

  const headers = new Headers({
    "user-agent": "hono-rss-reader/0.1",
    accept: "application/rss+xml, application/atom+xml, application/feed+json, application/xml, text/xml, */*"
  });

  if (cache.lastModified) headers.set("if-modified-since", cache.lastModified);
  else if (cache.etag) headers.set("if-none-match", cache.etag);

  let res: Response;
  let text: string;
  try {
    res = await fetch(url, { headers, signal: AbortSignal.timeout(15_000) });
    if (res.status === 304) return null;
    if (!res.ok) throw new FeedError(`The server answered ${res.status} ${res.statusText}`);
    if (Number(res.headers.get("content-lenght")) > MAX_BYTES) throw new FeedError("The feed is too large");
    text = await res.text();
  } catch (error) {
    if (error instanceof FeedError) throw error;
    if (error instanceof Error && error.name === "TimeoutError") throw new FeedError("The server took too long to answer");
    throw new FeedError("Couldn't reach that URL");
  }

  if (text.length > MAX_BYTES) throw new FeedError("The feed is too large");

  let parsed: AnyFeed<string>;
  try {
    parsed = parseFeed(text, { maxItems: MAX_ITEMS });
  } catch {
    throw new FeedError("That URL isn't an RSS, Atom or JSON feed");
  }

  return {
    url: res.url,
    etag: res.headers.get("etag"),
    lastModified: res.headers.get("last-modified"),
    ...normalize(parsed),
  };
}

function normalize(parsed: AnyFeed<string>): Omit<FetchedFeed, 'url' | 'etag' | 'lastModified'> {
  switch (parsed.format) {
    case 'rss': {
      const f = parsed.feed;
      return {
        format: 'rss',
        title: f.title ?? null,
        siteUrl: f.link ?? null,
        author: f.dc?.creators?.[0] ?? f.itunes?.author ?? null,
        items: compact((f.items ?? []).map((i) => ({
          guid: i.guid?.value ?? i.link,
          url: i.link,
          title: i.title,
          author: i.dc?.creators?.[0] ?? personName(i.authors?.[0]),
          publishedAt: i.pubDate ?? i.dc?.dates?.[0],
        }))),
      }
    }
    case 'atom': {
      const f = parsed.feed;
      const link = (links?: { href?: string; rel?: string; }[]) =>
        links?.find((l) => !l.rel || l.rel === "alternate")?.href ?? links?.[0]?.href;
      return {
        format: 'atom',
        title: f.title?.value ?? null,
        siteUrl: link(f.links) ?? null,
        author: f.authors?.[0]?.name ?? null,
        items: compact((f.entries ?? []).map((e) => ({
          guid: e.id,
          url: link(e.links),
          title: e.title?.value,
          author: e.authors?.[0]?.name,
          publishedAt: e.published ?? e.updated,
        }))),
      }
    }
    case 'rdf': {
      const f = parsed.feed;
      return {
        format: 'rdf',
        title: f.title ?? null,
        siteUrl: f.link ?? null,
        author: f.dc?.creators?.[0] ?? null,
        items: compact((f.items ?? []).map((i) => ({
          guid: i.link,
          url: i.link,
          title: i.title,
          author: i.dc?.creators?.[0],
          publishedAt: i.dc?.dates?.[0],
        }))),
      }
    }
    case 'json': {
      const f = parsed.feed;
      return {
        format: 'json',
        title: f.title ?? null,
        siteUrl: f.home_page_url ?? null,
        author: f.authors?.[0]?.name ?? null,
        items: compact((f.items ?? []).map((i) => ({
          guid: i.id,
          url: i.url ?? i.external_url,
          title: i.title,
          author: i.authors?.[0]?.name,
          publishedAt: i.date_modified ?? i.date_modified,
        }))),
      }
    }
  }
}

const personName = (p?: string | { name?: string }) => (typeof p === "string" ? p : p?.name);

type RawItem = {
  guid?: string;
  url?: string;
  title?: string;
  author?: string;
  publishedAt?: string;
};

function compact(items: RawItem[]): FeedItem[] {
  return items.flatMap(({ guid, url, title, author, publishedAt }) => {
    if (!url) return [];
    const date = publishedAt ? new Date(publishedAt) : null;
    return [{
      guid: guid || url,
      url,
      title: title?.trim() || null,
      author: author?.trim() || null,
      publishedAt: date && !Number.isNaN(date.getTime()) ? date : null,
    }];
  });
}