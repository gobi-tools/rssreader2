type RegisterProps = {
  title?: string;
  error?: string;
};

export default function Register({ error }: RegisterProps) {
  return <>
    <hgroup>
      <h1>Create account</h1>
      <p>Register with your email and a password</p>
    </hgroup>

    <article>
      {error && <p className="error" role="alert">{error}</p>}

      <form method="post" action="/register">
        <label htmlFor="email">
          <span>Email</span>
          <input id="email" name="email" type="email" autocomplete="email" placeholder="Email address" required />
        </label>

        <label htmlFor="password">
          <span>Password</span>
          <input id="password" name="password" type="password" autocomplete="new-password" minlength={8} placeholder="Password" required />
          <span className="error"><small>Password must have at least 8 characters</small></span>
        </label>

        <label htmlFor="confirm">
          <span>Confirm password</span>
          <input id="confirm" name="confirm" type="password" autocomplete="new-password" minlength={8} placeholder="Confirm password" required />
        </label>

        <button type="submit">Create account</button>
      </form>

      <p>Already registered? <a href="/login">Sign in</a></p>
    </article>
  </>;
}
