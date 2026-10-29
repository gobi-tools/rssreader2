import { TrashIcon } from "../common/Icons.js";
import Nav from "../common/Nav.js";

export type DeleteSubsctiptionProps = {
  subscriptionId: string;
}

export default function DeleteSubscription({ subscriptionId }: DeleteSubsctiptionProps) {
  return <>
    <header>
      <Nav active='feeds' />
    </header>
    <main>
      <hgroup>
        <h1>Delete?</h1>
        <p>Are you sure you want to delete this?</p>
      </hgroup>
      <hr />

      <div className={'row disable-mobile'}>
        <a href={`/feeds/subscription/${subscriptionId}`}>
          <button type={'reset'}>Cancel</button>
        </a>
        <div></div>
        <form
          method={'post'}
          action={`/feeds/subscription/${subscriptionId}/delete`}>
          <button className={'error'} type={'submit'}>
            <TrashIcon />
            <span>Delete</span>
          </button>
        </form>
      </div>


    </main>
  </>
}