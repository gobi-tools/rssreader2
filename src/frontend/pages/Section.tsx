import { useState } from 'preact/hooks';
import Nav from "../common/Nav.js";

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

export default function Section({ section, items }: SectionProps) {
  const [opened, setOpened] = useState<string[]>([]);
  const open = (id: string) => setOpened((ids) => [...ids, id]);

  return <>
    <header>
      <Nav active={'home'}/>
    </header>
    <main>
      <h1>{section.name}</h1>
      <p>
        <a href={`/sections/${section.id}/edit`}>Edit section</a>
      </p>
      {items.length === 0 && <p>Nothing here yet.</p>}
      {items.map((i) => {
        const title = i.title ?? i.url;
        const read = i.read || opened.includes(i.id);
        return (
          <div className="row" key={i.id}>
            <div className="col-3">{i.feedTitle}</div>
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
            <div className="col-2">{formatDate(i.date)}</div>
          </div>
        )
      })}
    </main>
  </>
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  const sameYear = date.getUTCFullYear() === new Date().getUTCFullYear();
  return date.toLocaleDateString("en-GB", {
    day: 'numeric',
    month: 'short',
    year: sameYear ? undefined : 'numeric',
    timeZone: 'UTC',
  });
}