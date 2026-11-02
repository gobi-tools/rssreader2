import { useState } from "preact/hooks";
import Nav from "../../common/Nav.js";

export type DeleteSubscriptionProps = {
  subscriptionId: string;
}

export default function DeleteSubscription({ subscriptionId }: DeleteSubscriptionProps) {
  const [busy, setBusy] = useState(false);
  
  return <>
    <header>
      <Nav active='feeds' />
    </header>
    <main>
      <section>
        <hgroup>
          <h1>Delete?</h1>
          <p>Are you sure you want to delete this?</p>
        </hgroup>
      </section>


      <form
        method={'post'}
        action={`/feeds/subscription/${subscriptionId}/delete`}
        onSubmit={() => setBusy(true)}>
        <div className={'row disable-mobile'}>
          <a href={`/feeds/subscription/${subscriptionId}`} role={'button'} aria-disabled={busy}>
            Cancel
          </a>
          <div></div>
          <button className={'error'} type={'submit'} disabled={busy} aria-busy={busy}>
            Delete
          </button>
        </div>
      </form>
    </main>
  </>
}