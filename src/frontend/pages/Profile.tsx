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
      <section role={'group'}>
        <div className={'row'}>
          <div class={'header'}>
            <hgroup>
              <h1>Profile</h1>
              <p>Welcome, {email}</p>
            </hgroup>
          </div>
        </div>
      </section>
      
      <form method="post" action="/logout">
        <button type="submit" class={'error'}>
          <LogoutIcon/>
          <span>Sign out</span>
        </button>
      </form>
    </main>
  </>
}