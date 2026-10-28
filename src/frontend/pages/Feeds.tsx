import Nav from "../common/Nav.js";

export type FeedItemProp = {
  id: String;
  title: string | null;
  url: string;
  siteUrl: string | null;
};

export type FeedsProps = {
  feeds: FeedItemProp[]
};

export default function Feeds({ feeds }: FeedsProps) {
  return <>
    <header>
      <Nav active={'feeds'}/>
    </header>
    <main>
      <h1>Feeds</h1>
      <p>
        <a href="/feeds/new">Add feed</a>
      </p>
      <ul>
        {feeds.map((f) => (
          <li key={f.id}>
            <a href={f.siteUrl ?? f.url}>{f.title ?? f.url}</a>
          </li>
        ))}
      </ul>
    </main>
  </>
}