import { PlusIcon } from "../common/Icons.js";
import Nav from "../common/Nav.js";

type SectionProp = {
  id: string;
  name: string;
};

type DashboardProps = {
  sections: SectionProp[];
};

export default function Home({ sections }: DashboardProps) {
  return <>
    <header>
      <Nav active={'home'} />
    </header>
    <main>
      <div role={'group'}>
        <div className={'row'}>
          <div className={'header'}>
            <hgroup>
              <h1>Home</h1>
              <span>{sections.length} Newsletters</span>
            </hgroup>
          </div>
        <a href="/sections/new">
          <button class={'success'}>
            <PlusIcon/>
          </button>
        </a>
        </div>
      </div>
      <hr/>

      <ul className={'main-list'}>
        {sections.map((s) => (
          <li key={s.id}>
            <a href={`/sections/${s.id}`}>{s.name}</a>
          </li>
        ))}
      </ul>
    </main>
  </>;
}
