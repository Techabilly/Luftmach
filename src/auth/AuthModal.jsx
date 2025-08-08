import React, { useState } from 'react';
import { useAuth } from './AuthContext.jsx';

export default function AuthModal({ open, onClose }) {
  const { signInWithEmail, signUpWithEmail, signInWithOAuth } = useAuth();
  const [tab, setTab] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const fn = tab === 'signin' ? signInWithEmail : signUpWithEmail;
    const { error } = await fn(email, password);
    if (error) setError(error.message);
    else onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ background: '#fff', padding: '1rem', width: '300px', position: 'relative' }}>
        <div style={{ display: 'flex', marginBottom: '1rem' }}>
          <button
            type="button"
            onClick={() => setTab('signin')}
            disabled={tab === 'signin'}
            style={{ flex: 1 }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setTab('signup')}
            disabled={tab === 'signup'}
            style={{ flex: 1 }}
          >
            Create Account
          </button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <div style={{ color: 'red' }}>{error}</div>}
          <button type="submit">{tab === 'signin' ? 'Sign In' : 'Sign Up'}</button>
        </form>
        <div style={{ margin: '1rem 0', textAlign: 'center' }}>or</div>
        <button
          type="button"
          onClick={() => signInWithOAuth('github')}
          style={{ width: '100%', marginBottom: '0.5rem' }}
        >
          Sign in with GitHub
        </button>
        <button type="button" onClick={() => signInWithOAuth('google')} style={{ width: '100%' }}>
          Sign in with Google
        </button>
        <button
          type="button"
          onClick={onClose}
          style={{ position: 'absolute', top: '0.25rem', right: '0.25rem' }}
        >
          ×
        </button>
      </div>
    </div>
  );
}
