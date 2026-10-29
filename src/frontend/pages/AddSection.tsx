import { PlusIcon, UpdateIcon } from "../common/Icons.js";
import Nav from "../common/Nav.js";

export type SectionFeedProp = {
  subscriptionId: string;
  title: string | null;
  url: string;
};

export type AddSectionProps = {
  heading: string;
  action: string;
  name?: string;
  feeds: SectionFeedProp[];
  checked?: string[]; // subscription ids
  deleteAction?: string; // set when editing
  formError?: string;
};

export default function AddSection({
  heading,
  action,
  name,
  feeds, 
  checked,
  deleteAction,
  formError
}: AddSectionProps
) {
  return <>
    <header>
      <Nav active={'feeds'}/>
    </header>
    <main>
      <h1>{heading}</h1>
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
                defaultChecked={checked?.includes(f.subscriptionId)}/>
              {f.title ?? f.url}
            </label>
          ))}
        </fieldset>

        <button type={'submit'}>
          {!deleteAction && <><PlusIcon/><span>Add</span></>}
          {deleteAction && <><UpdateIcon/><span>Update</span></>}
        </button>
      </form>
      {deleteAction && 
        <form 
          method={'post'}
          action={deleteAction}
          onSubmit={(e) => {
            if (!confirm("Delete this section?")) e.preventDefault()
          }}
        >
          <button type={'submit'}>Delete section</button>
        </form>
      }
    </main>
  </>
}