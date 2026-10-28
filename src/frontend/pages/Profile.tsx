import Nav from "../common/Nav.js";

type ProfileProps = {
  email: string;
};

export default function Profile({ email }: ProfileProps) {
  return <>
    <header>
      <Nav active={'profile'}></Nav>
    </header>
    <main>
      <h1>Profile</h1>
      <p>Welcome back, {email}</p>
      <form method="post" action="/logout">
        <button type="submit">Sign out</button>
      </form>
    </main>
  </>
}