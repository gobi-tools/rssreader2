import { useState } from 'preact/hooks';
import Nav from "../common/Nav.js";
import { groupByDate } from '../utills/utils.js';
import { EditIcon, OKIcon } from '../common/Icons.js';

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
          <a href={`/sections/${section.id}/read`} role={'button'}>
            <OKIcon />
          </a>
          <a href={`/sections/${section.id}/edit`} role={'button'}>
            <EditIcon />
          </a>
        </div>
      </div>
      <hr />

      {items.length === 0 && <p>Nothing here yet.</p>}
      {grouped.map((group) => (
        <section key={group.label}>
          <h2>{group.label}</h2>

          <ul className={'main-list'}>
            {group.items.map((i) => {
              const title = i.title ?? i.url;
              const read = i.read || opened.includes(i.id);

              return (
                <li key={i.id} className={'row padding-bottom-on-mobile'}>
                  <div>
                    <a
                      href={`/items/${i.id}/open`}
                      target={'_blank'}
                      rel={'noopener'}
                      onClick={() => open(i.id)}
                      onAuxClick={() => open(i.id)}>
                      {read && <span className={'read'}>{title}</span>}
                      {!read && <span>{title}</span>}
                    </a>
                    <span className={'text-light hide-on-desktop'}>
                      {i.feedTitle}
                    </span>
                  </div>
                  <div className={'col-3 text-light hide-on-mobile align-right'}>
                    {i.feedTitle}
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