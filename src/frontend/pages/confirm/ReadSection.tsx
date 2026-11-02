import { useState } from "preact/hooks";
import Nav from "../../common/Nav.js";

export type ReadSectionProps = {
  sectionId: string;
}

export default function ReadSection({ sectionId }: ReadSectionProps) {
  const [busy, setBusy] = useState(false);
  
  return <>
    <header>
      <Nav active='home' />
    </header>
    <main>
      <section>
        <hgroup>
          <h1>Read?</h1>
          <p>Are you sure you want to mark this section as read?</p>
        </hgroup>
      </section>

      <form
        method={'post'}
        action={`/sections/${sectionId}/read`}
        onSubmit={() => setBusy(true)}>
        <div className={'row disable-mobile'}>
          <a href={`/sections/${sectionId}`} role={'button'} type={'reset'} aria-disabled={busy}>
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