import { TrashIcon } from "../common/Icons.js";
import Nav from "../common/Nav.js";

export type DeleteSectionProps = {
  sectionId: string;
}

export default function DeleteSection({ sectionId }: DeleteSectionProps) {
  return <>
    <header>
      <Nav active='home' />
    </header>
    <main>
      <hgroup>
        <h1>Delete?</h1>
        <p>Are you sure you want to delete this?</p>
      </hgroup>
      <hr />

      <div className={'row disable-mobile'}>
        <a href={`/sections/${sectionId}`}>
          <button type={'reset'}>Cancel</button>
        </a>
        <div></div>
        <form
          method={'post'}
          action={`/sections/${sectionId}/delete`}>
          <button className={'error'} type={'submit'}>
            <TrashIcon />
            <span>Delete</span>
          </button>
        </form>
      </div>
    </main>
  </>
}