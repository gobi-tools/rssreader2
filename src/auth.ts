import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './db/index.js';
import * as schema from './db/schema.js';
import type { Context } from 'hono';

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? `http://localhost:${process.env.PORT ?? 3000}`,
  database: drizzleAdapter(db, {
    provider: 'sqlite',
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
});


/**
 * Forward a form submission to a better-auth endpoint as a sub-request.
 * Only origin/cookie/user-agent are passed through — better-auth owns
 * validation, credential checks, rate limiting and the session cookie.
 */
export const authRequest = (c: Context, path: string, payload: unknown): Promise<Response> => {
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  for (const name of ['origin', 'cookie', 'user-agent'] as const) {
    const value = c.req.header(name);
    if (value) headers[name] = value;
  }

  return auth.handler(
    new Request(new URL(path, c.req.url), {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    })
  );
};

/** Turn better-auth's error body into a message fit for the page. */
export const authError = async (res: Response): Promise<string> => {
  try {
    const data = (await res.json()) as { message?: string };
    return data.message ?? 'Something went wrong';
  } catch {
    return 'Something went wrong';
  }
};

/** Post/Redirect/Get: 303 + whatever Set-Cookie headers better-auth returned. */
export const redirectWithCookies = (c: Context, location: string, from: Response) => {
  c.header('Location', location);
  for (const cookie of from.headers.getSetCookie()) {
    c.header('Set-Cookie', cookie, { append: true });
  }
  return c.body(null, 303);
};


/** Parses a request body into semi-typed responses */
export const parseAuthBody = async (c: Context): Promise<Record<string, string>> => {
  return c.req.parseBody<Record<string, string>>();
}