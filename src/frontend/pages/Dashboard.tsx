type DashboardProps = {
  title?: string;
  user: {
    name: string;
    email: string;
  };
};

export default function Dashboard({ user }: DashboardProps) {
  return <>
    <hgroup>
      <h1>Dashboard</h1>
      <p>Welcome back, {user.name}</p>
    </hgroup>

    <article>
      <p>Signed in as <strong>{user.email}</strong>.</p>
      <p>This is your (currently empty) dashboard.</p>

      <form method="post" action="/logout">
        <button type="submit">Sign out</button>
      </form>
    </article>
  </>;
}
