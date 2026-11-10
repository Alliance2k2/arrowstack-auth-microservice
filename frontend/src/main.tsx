import { StrictMode, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { createRoot } from 'react-dom/client';
import { api, clearToken } from './api';
import './style.css';

type User = { id: string; name: string; email: string; role: 'USER' | 'ADMIN' };
type Page = 'login' | 'register' | 'dashboard' | 'profile' | 'admin';
function App() {
  const [user, setUser] = useState<User | null>(null);
  const [page, setPage] = useState<Page>('login');
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [adminPage, setAdminPage] = useState(1);
  const [total, setTotal] = useState(0);
  useEffect(() => {
    let active = true;
    api<{ user: User }>('/users/me')
      .then((data) => {
        if (active) {
          setUser(data.user);
          setPage('dashboard');
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setBusy(false);
      });
    return () => {
      active = false;
    };
  }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setNotice('');
    const form = new FormData(event.currentTarget);
    const email = String(form.get('email'));
    const password = String(form.get('password'));
    try {
      if (page === 'register') {
        await api('/auth/register', {
          method: 'POST',
          body: JSON.stringify({
            email,
            password,
            name: String(form.get('name')),
          }),
        });
        setPage('login');
        setNotice('Account created. Sign in to continue.');
      } else {
        const data = await api<{ user: User }>('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });
        setUser(data.user);
        setPage('dashboard');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to complete request');
    } finally {
      setBusy(false);
    }
  }
  async function signOut() {
    setBusy(true);
    setError('');
    try {
      await api('/auth/logout', { method: 'POST' });
      clearToken();
      setUser(null);
      setUsers([]);
      setPage('login');
    } catch {
      setError(
        'Logout failed. Please retry so your server session is revoked.',
      );
    } finally {
      setBusy(false);
    }
  }
  async function showAdmin(nextPage = 1) {
    setBusy(true);
    setError('');
    try {
      const data = await api<{ users: User[]; total: number }>(
        '/admin/users?page=' + nextPage,
      );
      setUsers(data.users);
      setTotal(data.total);
      setAdminPage(nextPage);
      setPage('admin');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load users');
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="shell">
      <header>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setPage(user ? 'dashboard' : 'login');
          }}
          className="brand"
        >
          A<span>Arrowstack Identity</span>
        </a>
        <span className="badge">Authentication service</span>
      </header>
      <main>
        <aside>
          <p className="eyebrow">FULL STACK / PROJECT 01</p>
          <h1>
            A secure start.
            <br />A clear identity.
          </h1>
          <p>
            Manage your session and explore access controlled by the
            authentication API.
          </p>
          <div className="principles">
            <span>01 - Verified credentials</span>
            <span>02 - Server-enforced roles</span>
            <span>03 - Rotating sessions</span>
          </div>
        </aside>
        <section className="panel" aria-busy={busy}>
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
          {notice && (
            <p role="status" className="notice">
              {notice}
            </p>
          )}
          {busy && <p role="status">Working...</p>}
          {!user ? (
            <>
              <h2>
                {page === 'register' ? 'Create your account' : 'Welcome back'}
              </h2>
              <p className="muted">
                {page === 'register'
                  ? 'New accounts receive the User role.'
                  : 'Sign in with your email and password.'}
              </p>
              <form onSubmit={submit} key={page}>
                {page === 'register' && (
                  <label>
                    Full name
                    <input
                      name="name"
                      autoComplete="name"
                      required
                      minLength={2}
                      maxLength={80}
                    />
                  </label>
                )}
                <label>
                  Email address
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    maxLength={254}
                  />
                </label>
                <label>
                  Password
                  <input
                    name="password"
                    type="password"
                    autoComplete={
                      page === 'register' ? 'new-password' : 'current-password'
                    }
                    minLength={page === 'register' ? 12 : 1}
                    maxLength={128}
                    required
                  />
                </label>
                {page === 'register' && (
                  <small>
                    Use at least 12 characters. Never reuse an important
                    password for a demo.
                  </small>
                )}
                <button disabled={busy} type="submit">
                  {page === 'register' ? 'Create account' : 'Sign in'}
                </button>
              </form>
              <button
                className="link"
                disabled={busy}
                onClick={() => {
                  setPage(page === 'register' ? 'login' : 'register');
                  setError('');
                  setNotice('');
                }}
              >
                {page === 'register'
                  ? 'Already registered? Sign in'
                  : 'New here? Create an account'}
              </button>
            </>
          ) : (
            <>
              <nav aria-label="Account">
                <button
                  aria-current={page === 'dashboard' ? 'page' : undefined}
                  disabled={busy}
                  onClick={() => setPage('dashboard')}
                >
                  Overview
                </button>
                <button
                  aria-current={page === 'profile' ? 'page' : undefined}
                  disabled={busy}
                  onClick={() => setPage('profile')}
                >
                  Profile
                </button>
                {user.role === 'ADMIN' && (
                  <button
                    aria-current={page === 'admin' ? 'page' : undefined}
                    disabled={busy}
                    onClick={() => void showAdmin()}
                  >
                    Administration
                  </button>
                )}
                <button disabled={busy} onClick={() => void signOut()}>
                  Sign out
                </button>
              </nav>
              <h2>
                {page === 'admin'
                  ? 'Administration'
                  : page === 'profile'
                    ? 'Your profile'
                    : `Welcome, ${user.name}`}
              </h2>
              <p className="muted">
                Signed in as <strong>{user.role}</strong>
              </p>
              {page === 'admin' ? (
                <>
                  <div className="table">
                    <table>
                      <caption>Registered accounts</caption>
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Role</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((item) => (
                          <tr key={item.id}>
                            <td>{item.name}</td>
                            <td>{item.email}</td>
                            <td>{item.role}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="pagination">
                    <button
                      disabled={busy || adminPage === 1}
                      onClick={() => void showAdmin(adminPage - 1)}
                    >
                      Previous
                    </button>
                    <span>
                      Page {adminPage} | {total} accounts
                    </span>
                    <button
                      disabled={busy || adminPage * 20 >= total}
                      onClick={() => void showAdmin(adminPage + 1)}
                    >
                      Next
                    </button>
                  </div>
                </>
              ) : page === 'dashboard' ? (
                <div className="overview">
                  <p>You are signed in. Manage your account from here.</p>
                  <dl className="account-summary">
                    <div>
                      <dt>Account role</dt>
                      <dd>
                        {user.role === 'ADMIN' ? 'Administrator' : 'User'}
                      </dd>
                    </div>
                    <div>
                      <dt>Access</dt>
                      <dd>
                        {user.role === 'ADMIN'
                          ? 'Profile and account administration'
                          : 'Your personal profile'}
                      </dd>
                    </div>
                  </dl>
                  <button disabled={busy} onClick={() => setPage('profile')}>
                    View your profile
                  </button>
                </div>
              ) : (
                <dl>
                  <dt>Name</dt>
                  <dd>{user.name}</dd>
                  <dt>Email</dt>
                  <dd>{user.email}</dd>
                  <dt>Account ID</dt>
                  <dd>{user.id}</dd>
                </dl>
              )}
              <p className="session-note">
                Sign out when using a shared device.
              </p>
            </>
          )}
        </section>
      </main>
      <footer>Arrowstack internship | Project demonstration</footer>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
