import { UserPlus } from 'lucide-react';
import { PageTitle } from '../components/PageTitle.jsx';
import { gateBranches } from '../data/branchData.js';

export function Register({ authForm, setAuthForm, submitAuth, setPage }) {
  return (
    <section className="auth-page">
      <PageTitle icon={UserPlus} title="Create Student Profile" text="Set your target exam date and build a preparation workspace around it." />
      <form className="panel form auth-card" onSubmit={(event) => submitAuth(event, 'register')}>
        <label>Name</label>
        <input placeholder="Name" value={authForm.name} onChange={(event) => setAuthForm({ ...authForm, name: event.target.value })} />
        <label>Email</label>
        <input placeholder="Email" value={authForm.email} onChange={(event) => setAuthForm({ ...authForm, email: event.target.value })} />
        <label>Password</label>
        <input placeholder="Password" type="password" value={authForm.password} onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })} />
        <label>GATE branch</label>
        <select value={authForm.branch} onChange={(event) => setAuthForm({ ...authForm, branch: event.target.value })}>
          {gateBranches.map((branch) => (
            <option value={branch.name} key={branch.code}>{branch.name} ({branch.code})</option>
          ))}
        </select>
        <label>Target GATE date</label>
        <input type="date" value={authForm.targetExamDate} onChange={(event) => setAuthForm({ ...authForm, targetExamDate: event.target.value })} />
        <button className="primary" type="submit"><UserPlus size={18} /> Register</button>
        <button className="link-button" type="button" onClick={() => setPage('login')}>Already have an account?</button>
      </form>
    </section>
  );
}
