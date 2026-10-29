import { useState } from 'preact/hooks';
import Nav from "../common/Nav.js";
import { formatDate } from '../utills/utils.js';
import { EditIcon } from '../common/Icons.js';

export type SectionProp = {
  id: string;
  name: string;
};

export type ItemProp = {
  id: string;
  title: string | null;
  url: string;
  date: string;
  feedTitle: string | null;
  read: boolean;
};

export type SectionProps = {
  section: SectionProp;
  items: ItemProp[];
}

export type GroupedItem = {
  id: string;
  title: string | null;
  url: string;
  date: string;
  feedTitle: string | null;
  read: boolean;
  day: string;
};

export type GroupedItems = Record<string, GroupedItem[]>;

export default function Section({ section, items }: SectionProps) {
  const [opened, setOpened] = useState<string[]>([]);
  const open = (id: string) => setOpened((ids) => [...ids, id]);

  const grouped = groupByDate(items);

  return <>
    <header>
      <Nav active={'home'} />
    </header>
    <main>
      <div role={'group'}>
        <div className={'row'}>
          <div>
            <hgroup>
              <h1>{section.name}</h1>
              <p>{items.length} articles</p>
            </hgroup>
          </div>
          <a href={`/sections/${section.id}/edit`}>
            <button>
              <EditIcon />
            </button>
          </a>
        </div>
      </div>
      <hr />

      {items.length === 0 && <p>Nothing here yet.</p>}
      {Object.keys(grouped).map((g) => {
        const items = grouped[g];
        return <>{
          items.map((i, index) => {
            const title = i.title ?? i.url;
            const read = i.read || opened.includes(i.id);
            return (
              <>
                <div className={`row disable-mobile ${index === items.length - 1 ? 'border-bottom' : ''}`} key={i.id}>
                  <div className="col-2">{i.feedTitle}</div>
                  <div className="col">
                    <a
                      href={`/items/${i.id}/open`}
                      target={'_blank'}
                      rel={'noopener'}
                      onClick={() => open(i.id)}
                      onAuxClick={() => open(i.id)}>
                      {read ? title : <strong>{title}</strong>}
                    </a>
                  </div>
                </div>
                {index === items.length - 1 &&
                  <div class={'row'}>
                    <div class={'column day-separator'}>
                      {i.day}
                    </div>
                  </div>}
              </>
            )
          })
        }
        </>
      })}


    </main>
  </>
}

function groupByDate(items: ItemProp[]): GroupedItems {
  const processed = items.map((i) => ({
    ...i,
    day: formatDate(i.date),
  }));

  const grouped = Object.groupBy(processed, i => i.day);
  return grouped;
}
