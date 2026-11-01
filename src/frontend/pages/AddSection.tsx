import Nav from "../common/Nav.js";
import { getHostname } from "../utills/utils.js";

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
  return <>
    <header>
      <Nav active={'home'} />
    </header>
    <main>

      <section>
        <hgroup>
          <h1>{heading}</h1>
          <p>{isEditing ? 'Update details' : 'Add details'}</p>
        </hgroup>
      </section>

      {formError && <p className="error">{formError}</p>}

      <form method='post' action={action}>
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
              <span className={`${f.isOrphan === true ? 'success' : ''}`}>{f.title ?? f.url}</span> <span className={'text-light hide-on-mobile'}>({getHostname(f.url)})</span>
            </label>
          ))}
        </fieldset>

        <div className={'row disable-mobile'}>
          <button type={'submit'}>
            {!isEditing && <><span>Add</span></>}
            {isEditing && <><span>Update</span></>}
          </button>
          <div></div>
          {isEditing &&
            <a href={`/sections/${id}/delete`} role={'button'} class={'error'}>
              <span>Delete</span>
            </a>
          }
        </div>
      </form>
    </main>
  </>
}