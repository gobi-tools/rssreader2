import Nav from "../../common/Nav.js";

export type ReadSectionProps = {
  sectionId: string;
}

export default function ReadSection({ sectionId }: ReadSectionProps) {
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

      <div className={'row disable-mobile'}>
        <a href={`/sections/${sectionId}`}>
          <button type={'reset'}>Cancel</button>
        </a>
        <div></div>
        <form
          method={'post'}
          action={`/sections/${sectionId}/read`}>
          <button type={'submit'}>
            <span>Read all</span>
          </button>
        </form>
      </div>
    </main>
  </>
}