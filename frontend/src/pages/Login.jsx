import { LogIn } from 'lucide-react';
import { PageTitle } from '../components/PageTitle.jsx';

export function Login({ authForm, setAuthForm, submitAuth, setPage }) {
  return (
    <section className="auth-page">
      <PageTitle icon={LogIn} title="Welcome Back" text="Open your saved GATE prep dashboard and continue from today's targets." />
      <form className="panel form auth-card" onSubmit={(event) => submitAuth(event, 'login')}>
        <label>Email</label>
        <input placeholder="Email" value={authForm.email} onChange={(event) => setAuthForm({ ...authForm, email: event.target.value })} />
        <label>Password</label>
        <input placeholder="Password" type="password" value={authForm.password} onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })} />
        <button className="primary" type="submit"><LogIn size={18} /> Login</button>
        <button className="link-button" type="button" onClick={() => setPage('register')}>Create a new account</button>
      </form>
    </section>
  );
}
