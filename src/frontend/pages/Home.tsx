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
      <h1>Home</h1>
      <p>
        <a href="/sections/new">New Section</a>
      </p>
      <ul>
        {sections.map((s) => (
          <li key={s.id}>
            <a href={`/sections/${s.id}`}>{s.name}</a>
          </li>
        ))}
      </ul>
    </main>
  </>;
}
