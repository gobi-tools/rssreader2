import { useState } from 'preact/hooks';
import Nav from "../common/Nav.js";
import { formatDate, getYear } from '../utills/utils.js';
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

export default function Section({ section, items }: SectionProps) {
  const [opened, setOpened] = useState<string[]>([]);
  const open = (id: string) => setOpened((ids) => [...ids, id]);

  const details = addDetails(items);

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
      {details.map((i, index) => {
        const title = i.title ?? i.url;
        const read = i.read || opened.includes(i.id);

        return (
          <>
            <div className={`row disable-mobile ${index === items.length - 1 ? 'border-bottom' : ''}`} key={i.id}>
              <div className="col-3 text-light one-line">{i.feedTitle}</div>
              <div className="col one-line">
                <a
                  href={`/items/${i.id}/open`}
                  target={'_blank'}
                  rel={'noopener'}
                  onClick={() => open(i.id)}
                  onAuxClick={() => open(i.id)}>
                  {read ? title : <strong>{title}</strong>}
                </a>
              </div>
              <div className={'col-2 text-light align-right'}>
                {i.day}
              </div>
            </div>
            {index > 0 && details?.[index - 1]?.year !== details?.[index]?.year &&
              <div class={'row'}>
                <div class={'column day-separator'}>
                  {i.year}
                </div>
              </div>
            }
          </>
        )
      })}
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