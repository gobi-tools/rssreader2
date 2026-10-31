import { PlusIcon } from "../common/Icons.js";
import Nav from "../common/Nav.js";
import { getHostname } from "../utills/utils.js";

export type FeedItemProp = {
  id: String;
  title: string | null;
  url: string;
  siteUrl: string | null;
  isOrphan: boolean;
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
      <section role={"group"}>
        <div className={"row"}>
          <div class={'header'}>
            <hgroup>
              <h1>Feeds</h1>
              <span>{feeds.length} Feeds</span>
            </hgroup>
          </div>
          <a href="/feeds/new">
            <button className={'success button-small'}>
              <PlusIcon />
            </button>
          </a>
        </div>
      </section>

      <ul className={'main-list'}>
        {feeds.map((f) => (
          <li key={f.subscriptionId} className={'row'}>
            <div>
              <a 
                className={`${f.isOrphan === true ? 'success' : ''}`}
                href={`/feeds/subscription/${f.subscriptionId}`}>
                {f.title ?? f.url}
              </a>
            </div>
            <div className={'col-5 text-light hide-on-mobile align-right no-wrap'}>
              {getHostname(f.url)}
            </div>
          </li>
        ))}
      </ul>
    </main>
  </>
}
