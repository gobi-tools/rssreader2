import { useState } from "preact/hooks";
import Nav from "../common/Nav.js";
import { formatDate } from "../utills/utils.js";
import { TrashIcon } from "../common/Icons.js";

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
  subscriptionId: string;
}

export type FeedProps = {
  feed: FeedProp,
  items: ItemProp[];
}

export default function Feed({ feed, items }: FeedProps) {
  const [opened, setOpened] = useState<string[]>([]);
  const open = (id: string) => setOpened((ids) => [...ids, id]);

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
              <a href={feed.url} target={'_blank'}>{feed.url}</a>
            </hgroup>
          </div>
          <form
            method={'post'}
            action={`/feeds/subscription/${feed.subscriptionId}/delete`}
            onSubmit={(e) => {
              if (!confirm("Delete this feed?")) e.preventDefault()
            }}
          >
            <button className={'error'} type={'submit'}>
              <TrashIcon/>
            </button>
          </form>
        </div>
      </div>
      <hr/>

      {items.length === 0 && <p>Nothing here yet.</p>}
      {items.map((i) => {
        const name = i.title ?? i.url;
        const read = i.read || opened.includes(i.id);
        return (
          <div className="row" key={i.id}>
            <div className="col">
              <a
                href={`/items/${i.id}/open`}
                target={'_blank'}
                rel={'noopener'}
                onClick={() => open(i.id)}
                onAuxClick={() => open(i.id)}>
                {read ? name : <strong>{name}</strong>}
              </a>
            </div>
            <div className="col-2">{formatDate(i.date)}</div>
          </div>
        )
      })}
    </main>
  </>
}