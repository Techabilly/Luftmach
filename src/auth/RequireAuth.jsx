import React from 'react';
import { useAuth } from './AuthContext.jsx';

export default function RequireAuth({ children, onOpenAuth }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>;
  }

  if (!user) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          gap: '1rem',
        }}
      >
        <p>Sign in to continue</p>
        <button type="button" onClick={onOpenAuth}>
          Sign in
        </button>
      </div>
    );
  }

  return children;
}
