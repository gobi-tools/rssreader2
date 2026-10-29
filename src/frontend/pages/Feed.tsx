import { useState } from "preact/hooks";
import Nav from "../common/Nav.js";
import { formatDate, getYear } from "../utills/utils.js";
import { EditIcon, TrashIcon } from "../common/Icons.js";

export type ItemProp = {
  id: string;
  title: string | null;
  url: string;
  date: string;
  feedTitle: string | null;
  read: boolean;
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

  const details = addDetails(items);

  return <>
    <header>
      <Nav active={'feeds'} />
    </header>
    <main>
      <div role={'group'}>
        <div className={'row'}>
          <div>
            <hgroup>
              <h1>{feed.title}</h1>
              <a href={feed.siteUrl} target={'_blank'}>{feed.siteUrl}</a>
            </hgroup>
          </div>
          <a href={`/feeds/subscription/${feed.subscriptionId}/delete/confirm`}>
            <button>
              <EditIcon />
            </button>
          </a>
        </div>
      </div>
      <hr />

      {items.length === 0 && <p>Nothing here yet.</p>}
      <ul className={'main-list'}>
        {details.map((current, index) => {
          const title = current.title ?? current.url;
          const read = current.read || opened.includes(current.id);

          const previous = details?.[index - 1];

          const showYear = index > 0 && previous.year !== current.year;

          return (
            <li>
              <div className={`row disable-mobile ${index === items.length - 1 ? 'border-bottom' : ''}`} key={current.id}>
                <div className="col one-line">
                  <a
                    href={`/items/${current.id}/open`}
                    target={'_blank'}
                    rel={'noopener'}
                    onClick={() => open(current.id)}
                    onAuxClick={() => open(current.id)}>
                    {read ? <span>{title}</span> : <strong>{title}</strong>}
                  </a>
                </div>
                <div className={'col-2 text-light align-right'}>
                  {current.day}
                </div>
              </div>
              {showYear &&
                <div class={'row'}>
                  <div class={'column day-separator'}>
                    {current.year}
                  </div>
                </div>
              }
            </li>
          )
        })}
      </ul>
    </main>
  </>
}

function addDetails(items: ItemProp[]): DetailedItem[] {
  return items.map((i) => ({
    ...i,
    day: formatDate(i.date),
    year: getYear(i.date),
  }))
}