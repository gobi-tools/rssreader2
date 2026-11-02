import { useState } from 'preact/hooks';
import Nav from "../common/Nav.js";
import { filterRead, groupByDate } from '../utills/utils.js';
import { EditIcon, OKIcon, UnreadIcon } from '../common/Icons.js';

export type SectionProp = {
  id: string;
  name: string;
  unread: number;
};

export type ItemProp = {
  id: string;
  title: string | null;
  url: string;
  date: string;
  feedTitle: string | null;
  read: boolean;
  index: number;
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

  const [showUnread, setShowUnread] = useState(false);

  const grouped = groupByDate(items);
  const filtered = filterRead(grouped, showUnread);

  return <>
    <header>
      <Nav active={'home'} />
    </header>
    <main>
      <section role={'group'}>
        <div className={'row'}>
          <div className={'header'}>
            <hgroup>
              <h1>{section.name}</h1>
              <p>{items.length} articles {section.unread > 0 && <span className={'success'}>({section.unread} new)</span>}</p>
            </hgroup>
          </div>
          <button
            onClick={() => setShowUnread(!showUnread)} 
            className={`button-small ${showUnread && 'success'}`}>
            <UnreadIcon/>
          </button>
          <a href={`/sections/${section.id}/read`} role={'button'} className={'button-small'}>
            <OKIcon />
          </a>
          <a href={`/sections/${section.id}/edit`} role={'button'} className={'button-small'}>
            <EditIcon />
          </a>
        </div>
      </section>

      {items.length === 0 && <p>Nothing here yet.</p>}
      {filtered.map((group) => (
        <section key={group.label}>
          <h2>{group.label}</h2>

          <ul className={'main-list'}>
            {group.items.map((i) => {
              const title = i.title ?? i.url;
              const read = i.read || opened.includes(i.id);

              return (
                <li key={i.id} className={'row padding-bottom-on-mobile'}>
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
                    <span className={'text-light hide-on-desktop'}>
                      {i.feedTitle}
                    </span>
                  </div>
                  <div className={'col-3 text-light hide-on-mobile align-right no-wrap'}>
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