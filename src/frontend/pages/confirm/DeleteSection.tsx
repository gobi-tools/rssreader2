import { useState } from "preact/hooks";
import Nav from "../../common/Nav.js";
import { bytes } from "stream/consumers";

export type DeleteSectionProps = {
  sectionId: string;
}

export default function DeleteSection({ sectionId }: DeleteSectionProps) {
  const [busy, setBusy] = useState(false);

  return <>
    <header>
      <Nav active='home' />
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
        action={`/sections/${sectionId}/delete`}
        onSubmit={() => setBusy(true)}>
        <div className={'row disable-mobile'}>
          <a href={`/sections/${sectionId}`} role={'button'} aria-disabled={busy}>
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