import { useEffect, useState } from "preact/hooks";
import Nav from "../common/Nav.js";
import { PlusIcon } from "../common/Icons.js";

export type AddFeedProps = {
  url?: string;
  formError?: string;
};

export default function AddFeed({ url, formError }: AddFeedProps) {
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const reset = (e: PageTransitionEvent) => e.persisted && setBusy(false);
    window.addEventListener('pageshow', reset);
    return () => window.removeEventListener('pageshow', reset);
  }, []);

  return <>
    <header>
      <Nav active={'feeds'} />
    </header>
    <main>
      <section>
        <hgroup>
          <h1>New feed</h1>
          <p>Add details</p>
        </hgroup>
      </section>

      {formError && <p className="error">{formError}</p>}
      <form method="post" action="/feeds" onSubmit={() => setBusy(true)}>
        <label>
          Feed URL
          <input
            type={'url'}
            name={'url'}
            defaultValue={url}
            required
            readOnly={busy}
            placeholder={'https://example.com/feed'}
          />
        </label>
        <button type={'submit'} disabled={busy} aria-busy={busy}>
          <PlusIcon />
          <span>Add</span>
        </button>
      </form>
    </main>
  </>
}