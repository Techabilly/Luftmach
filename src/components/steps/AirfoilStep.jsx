import React from 'react';
import DesignApp from '../../App.jsx';
import { useAuth } from '../../auth/AuthContext.jsx';
import { getDesignState, getDesignThumbnail } from '../../lib/designState.js';

export default function AirfoilStep({ onSave, onSaveAs, onLoad }) {
  const { user } = useAuth();
  return (
    <div>
      {user && (
        <div style={{ padding: '0.5rem', display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={() =>
              onSave({ data: getDesignState(), thumbnail: getDesignThumbnail() })
            }
            disabled={!user}
          >
            Save
          </button>
          <button
            type="button"
            onClick={() =>
              onSaveAs({ data: getDesignState(), thumbnail: getDesignThumbnail() })
            }
            disabled={!user}
          >
            Save as…
          </button>
          <button type="button" onClick={onLoad} disabled={!user}>
            Load
          </button>
        </div>
      )}
      <DesignApp showAirfoilControls />
    </div>
  );
}
