import React from 'react';
import DesignApp from '../../App.jsx';
import { useAuth } from '../../auth/AuthContext.jsx';
import { getDesignState } from '../../lib/designState.js';

export default function BuildStep({ onSave, onSaveAs, onLoad }) {
  const { user } = useAuth();
  return (
    <div>
      {user && (
        <div style={{ padding: '0.5rem', display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={() => onSave(getDesignState())}
            disabled={!user}
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => onSaveAs(getDesignState())}
            disabled={!user}
          >
            Save as…
          </button>
          <button type="button" onClick={onLoad} disabled={!user}>
            Load
          </button>
        </div>
      )}
      <DesignApp showAirfoilControls={false} />
    </div>
  );
}
