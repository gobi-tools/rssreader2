import { Hono } from 'hono';
import Login from '../frontend/pages/Login.js';
import Register from '../frontend/pages/Register.js';
import { guestOnly, type AuthEnv } from '../middleware/session.js';
import { authError, authRequest, parseAuthBody, redirectWithCookies } from '../auth.js';
import r from '../frontend/react-srv.js';

const renderLogin = (error?: string) =>
  r.render(Login, { title: 'Sign in', error });

const renderRegister = (error?: string) =>
  r.render(Register, { title: 'Create account', error });

export const authRoutes = new Hono<AuthEnv>()
  .get('/', (c) => c.redirect('/home'))
  .get('/login', guestOnly, (c) => c.html(renderLogin()))
  .get('/register', guestOnly, (c) => c.html(renderRegister()))
  .post('/login', async (c) => {
    const { email, password } = await parseAuthBody(c);
    const res = await authRequest(c, '/api/auth/sign-in/email', { email, password });

    if (res.ok) {
      return redirectWithCookies(c, '/home', res);
    }

    return c.html(renderLogin(await authError(res)), res.status === 401 ? 401 : 400);
  })
  .post('/register', async (c) => {
    const { email, password, confirm } = await parseAuthBody(c);

    if (password !== confirm) {
      return c.html(renderRegister('Passwords do not match'), 400);
    }

    const name = email?.split('@')[0] ?? email;

    const res = await authRequest(c, '/api/auth/sign-up/email', { name, email, password });
    if (res.ok) {
      return redirectWithCookies(c, '/home', res);
    }

    return c.html(renderRegister(await authError(res)), 400);
  })
  .post('/logout', async (c) => {
    const res = await authRequest(c, '/api/auth/sign-out', {});
    return redirectWithCookies(c, '/login', res);
  });
