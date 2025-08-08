import React from 'react';
import { useAuth } from '../../auth/AuthContext.jsx';
import RequireAuth from '../../auth/RequireAuth.jsx';

export default function ExportStep({ onOpenAuth }) {
  const { user } = useAuth();
  if (!user) {
    return <RequireAuth onOpenAuth={onOpenAuth}> </RequireAuth>;
  }
  return (
    <div style={{ padding: '20px' }}>
      <h2>Export</h2>
      <p>Prepare your layout for fabrication in SVG or DXF format.</p>
    </div>
  );
}
