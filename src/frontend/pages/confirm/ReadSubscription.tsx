import Nav from "../../common/Nav.js";

export type ReadSubscriptionProps = {
  subscriptionId: string;
}

export default function ReadSubscription({ subscriptionId }: ReadSubscriptionProps) {
  return <>
    <header>
      <Nav active='feeds' />
    </header>
    <main>
      <section>
        <hgroup>
          <h1>Read?</h1>
          <p>Are you sure you want to mark this feed as read?</p>
        </hgroup>
      </section>

      <div className={'row disable-mobile'}>
        <a href={`/feeds/subscription/${subscriptionId}`}>
          <button type={'reset'}>Cancel</button>
        </a>
        <div></div>
        <form
          method={'post'}
          action={`/feeds/subscription/${subscriptionId}/read`}>
          <button type={'submit'}>
            <span>Read all</span>
          </button>
        </form>
      </div>
    </main>
  </>
}