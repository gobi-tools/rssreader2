import { TrashIcon } from "../../common/Icons.js";
import Nav from "../../common/Nav.js";

export type DeleteSubscriptionProps = {
  subscriptionId: string;
}

export default function DeleteSubscription({ subscriptionId }: DeleteSubscriptionProps) {
  return <>
    <header>
      <Nav active='feeds' />
    </header>
    <main>
      <section>
        <hgroup>
          <h1>Delete?</h1>
          <p>Are you sure you want to delete this?</p>
        </hgroup>
      </section>

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