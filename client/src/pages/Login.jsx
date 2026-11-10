import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e, creds = form) => {
    e?.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (mode === 'login') await login(creds.email, creds.password);
      else await register(creds.name, creds.email, creds.password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const demo = () => {
    setMode('login');
    login('demo@sargam.dev', 'demo1234')
      .then(() => navigate('/'))
      .catch((err) => setError(err.message));
  };

  return (
    <div className="auth">
      <h1 className="page-title">{mode === 'login' ? 'Log in to Sargam' : 'Create your account'}</h1>
      <form onSubmit={submit}>
        {mode === 'register' && (
          <label>Name<input value={form.name} onChange={set('name')} autoComplete="name" required /></label>
        )}
        <label>Email<input type="email" value={form.email} onChange={set('email')} autoComplete="email" required /></label>
        <label>Password<input type="password" value={form.password} onChange={set('password')} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={mode === 'register' ? 8 : undefined} required /></label>
        {error && <p className="error" role="alert">{error}</p>}
        <button className="btn" disabled={busy}>{mode === 'login' ? 'Log in' : 'Create account'}</button>
      </form>
      <button className="text-btn" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
        {mode === 'login' ? 'New here? Create an account' : 'Already have an account? Log in'}
      </button>
      <hr />
      <button className="btn ghost" onClick={demo}>Explore with the demo account</button>
    </div>
  );
}
