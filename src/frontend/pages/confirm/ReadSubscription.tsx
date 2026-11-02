import { useState } from "preact/hooks";
import Nav from "../../common/Nav.js";

export type ReadSubscriptionProps = {
  subscriptionId: string;
}

export default function ReadSubscription({ subscriptionId }: ReadSubscriptionProps) {
  const [busy, setBusy] = useState(false);

  return <>
    <header>
      <Nav active='feeds' />
    </header>
    <main>
      <section>
        <hgroup>
          <h1>Read?</h1>
          <p>Are you sure you want to mark this feed as read?</p>
        </hgroup>
      </section>

      <form
        method={'post'}
        action={`/feeds/subscription/${subscriptionId}/read`}
        onSubmit={() => setBusy(true)}>
        <div className={'row disable-mobile'}>
          <a href={`/feeds/subscription/${subscriptionId}`} role={'button'} type={'reset'} aria-disabled={busy}>
           Cancel
          </a>
          <div></div>
          <button type={'submit'} disabled={busy} aria-busy={busy}>
            Read all
          </button>
        </div>
      </form>
    </main>
  </>
}