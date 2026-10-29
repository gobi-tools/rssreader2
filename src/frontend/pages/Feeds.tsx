import { PlusIcon } from "../common/Icons.js";
import Nav from "../common/Nav.js";

export type FeedItemProp = {
  id: String;
  title: string | null;
  url: string;
  subscriptionId: string;
};

export type FeedsProps = {
  feeds: FeedItemProp[]
};

export default function Feeds({ feeds }: FeedsProps) {
  return <>
    <header>
      <Nav active={'feeds'} />
    </header>
    <main>
      <div role={"group"}>
        <div className={"row"}>
          <div>
            <hgroup>
              <h1>Feeds</h1>
              <span>{feeds.length} Feeds</span>
            </hgroup>
          </div>
          <a href="/feeds/new">
            <button className={'success'} type={'reset'}>
              <PlusIcon />
            </button>
          </a>
        </div>
      </div>
      <hr />

      <ul className={'main-list'}>
        {feeds.map((f) => (
          <li key={f.subscriptionId}>
            <a href={`/feeds/subscription/${f.subscriptionId}`}>{f.title ?? f.url}</a>
          </li>
        ))}
      </ul>
    </main>
  </>
}