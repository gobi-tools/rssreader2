import { useState } from "preact/hooks";
import Nav from "../common/Nav.js";
import { getHostname, groupByDate } from "../utills/utils.js";
import { EditIcon, OKIcon, TrashIcon } from "../common/Icons.js";

export type ItemProp = {
  id: string;
  title: string | null;
  url: string;
  date: string;
  feedTitle: string | null;
  read: boolean;
  index: number;
};

export type FeedProp = {
  title: string;
  url: string;
  siteUrl: string;
  subscriptionId: string;
};

export type FeedProps = {
  feed: FeedProp,
  items: ItemProp[];
};

export type DetailedItem = {
  id: string;
  title: string | null;
  url: string;
  date: string;
  feedTitle: string | null;
  read: boolean;
  day: string;
  year: number;
};

export default function Feed({ feed, items }: FeedProps) {
  const [opened, setOpened] = useState<string[]>([]);
  const open = (id: string) => setOpened((ids) => [...ids, id]);

  const grouped = groupByDate(items);

  return <>
    <header>
      <Nav active={'feeds'} />
    </header>
    <main>
      <section role={'group'}>
        <div className={'row'}>
          <div className={'header'}>
            <hgroup>
              <h1>{feed.title}</h1>
              <a className={'word-break'} href={feed.siteUrl} target={'_blank'}>{getHostname(feed.url)}</a>
            </hgroup>
          </div>
          <a role={'button'} className={'button-small'} href={`/feeds/subscription/${feed.subscriptionId}/read`}>
            <OKIcon/>
          </a>
          <a role={'button'} className={'error button-small'} href={`/feeds/subscription/${feed.subscriptionId}/delete`}>
            <TrashIcon/>
          </a>
        </div>
      </section>

      {items.length === 0 && <p>Nothing here yet.</p>}
      {grouped.map((group) => (
        <section key={group.label}>
          <h2>{group.label}</h2>

          <ul className={'main-list'}>
            {group.items.map((i) => {
              const title = i.title ?? i.url;
              const read = i.read || opened.includes(i.id);

              return (
                <li key={i.id}>
                  <div>
                    <span>{i.index + 1}</span>
                    <span>&#46; </span>
                    <a
                      href={`/items/${i.id}/open`}
                      target={'_blank'}
                      rel={'noopener'}
                      onClick={() => open(i.id)}
                      onAuxClick={() => open(i.id)}>
                      {read && <span className={'read'}>{title}</span>}
                      {!read && <span>{title}</span>}
                    </a>
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </main>
  </>
}