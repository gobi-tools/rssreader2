import { LogoutIcon } from "../common/Icons.js";
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
      <div role={'group'}>
        <div className={'row'}>
          <div>
            <hgroup>
              <h1>Profile</h1>
              <p>Welcome back, {email}</p>
            </hgroup>
          </div>
        </div>
      </div>
      <hr />
      <form method="post" action="/logout">
        <button type="submit" class={'error'}>
          <LogoutIcon/>
          <span>Sign out</span>
        </button>
      </form>
    </main>
  </>
}