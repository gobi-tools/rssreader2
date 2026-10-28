import Nav from "../common/Nav.js";

type DashboardProps = {
  title?: string;
  user: {
    name: string;
    email: string;
  };
};

export default function Dashboard({ user }: DashboardProps) {
  return <>
    <header>
      <Nav active={'home'} />
    </header>
    <main>
      <h1>Home</h1>
    </main>
  </>;
}
