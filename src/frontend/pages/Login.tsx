type LoginProps = {
  title?: string;
  error?: string;
};

export default function Login({ error }: LoginProps) {
  return <>
    <hgroup>
      <h1>Sign in</h1>
      <p>Enter your credentials to continue</p>
    </hgroup>

    <article>
      {error && <p className="error" role="alert">{error}</p>}

      <form method="post" action="/login">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autocomplete="email" placeholder="Email address" required />

        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" autocomplete="current-password" placeholder="Password" required />

        <button type="submit">Sign in</button>
      </form>

      <p>No account yet? <a href="/register">Create one</a></p>
    </article>
  </>;
}
