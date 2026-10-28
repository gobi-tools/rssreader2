import type { MiddlewareHandler } from 'hono';
import { auth } from '../auth.js';

/** The `{ session, user }` object better-auth returns for a signed-in request. */
export type Session = NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>;

/** Variables the middlewares in this file put on the context. */
export type AuthVariables = {
  session: Session | null;
  user: Session['user'] | null;
};

export type AuthEnv = { Variables: AuthVariables };

export type AuthedVariables = {
  session: Session,
  user: Session['user'],
};

export type AuthedEnv = { Variables: AuthedVariables };

/**
 * Resolves the session from the request's cookies once and exposes
 * session/user on the context. Without a cookie better-auth short-circuits
 * before touching the database, so it's cheap on the anonymous path.
 */
export const session: MiddlewareHandler<AuthEnv> = async (c, next) => {
  const current = await auth.api.getSession({ headers: c.req.raw.headers });
  c.set('session', current);
  c.set('user', current?.user ?? null);
  await next();
};

/** Guard: signed-in only — otherwise back to the login form. */
export const requireAuth: MiddlewareHandler<AuthEnv> = async (c, next) => {
  if (!c.get('session')) {
    return c.redirect('/login', 303);
  }
  await next();
};

/** Guard: guests only — signed-in users get bounced to the dashboard. */
export const guestOnly: MiddlewareHandler<AuthEnv> = async (c, next) => {
  if (c.get('session')) {
    return c.redirect('/home', 303);
  }
  await next();
};
