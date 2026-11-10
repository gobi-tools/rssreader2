import { useState } from "preact/hooks";
import Nav from "../common/Nav.js";
import { getHostname } from "../utills/utils.js";
import { TrashIcon } from "../common/Icons.js";

export type SectionFeedProp = {
  subscriptionId: string;
  title: string | null;
  url: string;
  siteUrl: string | null;
  isOrphan: boolean;
};

export type AddSectionProps = {
  id: string,
  heading: string;
  action: string;
  name?: string;
  feeds: SectionFeedProp[];
  checked?: string[]; // subscription ids
  isEditing?: boolean; // set when editing
  formError?: string;
};

export default function AddSection({
  id,
  heading,
  action,
  name,
  feeds,
  checked,
  isEditing,
  formError
}: AddSectionProps
) {
  const [busy, setBusy] = useState(false);

  return <>
    <header>
      <Nav active={'home'} />
    </header>
    <main>

      <section role={'group'}>
        <div className={'row'}>
          <div className={'header'}>
            <hgroup>
              <h1>{heading}</h1>
              <p>{isEditing ? 'Update details' : 'Add details'}</p>
            </hgroup>
          </div>
          {isEditing &&
            <a role={'button'} href={`/sections/${id}/delete`} className={'error button-small'}>
              <TrashIcon />
            </a>
          }
        </div>
      </section>

      {formError && <p className="error">{formError}</p>}

      <form method='post' action={action} onSubmit={() => setBusy(true)}>
        <label>
          Name
          <input type={'text'} name={'name'} defaultValue={name} required placeholder={"e.g. Tech"} />
        </label>
        <fieldset>
          <legend>Feeds</legend>

          {feeds.length === 0 &&
            <p>No feeds yet. <a href="/feeds/new">Add a feed</a> first.</p>}

          {feeds.map((f) => (
            <label key={f.subscriptionId}>
              <input
                type={"checkbox"}
                name={"subscriptionIds"}
                value={f.subscriptionId}
                defaultChecked={checked?.includes(f.subscriptionId)} />
              <span className={'padding-left'}>
                <span className={`${f.isOrphan === true ? 'success' : ''}`}>
                  {f.title ?? f.url}
                </span>
                <br />
                <span className={'text-light'}>
                  <small>{getHostname(f.url)}</small>
                </span>
              </span>
            </label>
          ))}
        </fieldset>

        <div className={'row disable-mobile'}>
          <div></div>
          <button type={'submit'} aria-busy={busy} disabled={busy}>
            {!isEditing && <><span>Add</span></>}
            {isEditing && <><span>Update</span></>}
          </button>
        </div>
      </form>
    </main>
  </>
}