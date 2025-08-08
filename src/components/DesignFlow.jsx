import React, { useState } from 'react';
import TemplateStep from './steps/TemplateStep.jsx';
import BuildStep from './steps/BuildStep.jsx';
import AirfoilStep from './steps/AirfoilStep.jsx';
import ExportStep from './steps/ExportStep.jsx';
import AuthModal from '../auth/AuthModal.jsx';
import { useAuth } from '../auth/AuthContext.jsx';
import { createDesign, deleteDesign, listDesigns, updateDesign } from '../data/designsApi.js';
import { setDesignState } from '../lib/designState.js';

function UserMenu({ email, onSignOut, onShowDesigns }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <button type="button" onClick={() => setOpen((o) => !o)}>
        {email}
      </button>
      {open && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            background: '#fff',
            color: '#000',
            border: '1px solid #ccc',
            minWidth: '150px',
            zIndex: 20,
          }}
        >
          <button
            type="button"
            onClick={() => {
              onShowDesigns();
              setOpen(false);
            }}
            style={{ width: '100%', padding: '0.5rem', textAlign: 'left' }}
          >
            My Designs
          </button>
          <button
            type="button"
            onClick={onSignOut}
            style={{ width: '100%', padding: '0.5rem', textAlign: 'left' }}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

export default function DesignFlow() {
  const [current, setCurrent] = useState(0);
  const { user, signOut } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [currentDesignId, setCurrentDesignId] = useState(null);
  const [designs, setDesigns] = useState([]);
  const [showLoad, setShowLoad] = useState(false);

  const handleSave = async ({ data, thumbnail }) => {
    if (!user) return;
    if (currentDesignId) {
      await updateDesign(currentDesignId, { data, thumbnail });
    } else {
      await handleSaveAs({ data, thumbnail });
    }
  };

  const handleSaveAs = async ({ data, thumbnail }) => {
    if (!user) return;
    const name = window.prompt('Design name');
    if (!name) return;
    const row = await createDesign({ name, data, thumbnail });
    setCurrentDesignId(row.id);
  };

  const openLoad = async () => {
    const list = await listDesigns();
    setDesigns(list);
    setShowLoad(true);
  };

  const loadDesign = (design) => {
    setCurrentDesignId(design.id);
    setShowLoad(false);
    setDesignState(design.data);
  };

  const steps = [
    { label: 'Templates', component: <TemplateStep /> },
    {
      label: 'Build',
      component: (
        <BuildStep onSave={handleSave} onSaveAs={handleSaveAs} onLoad={openLoad} />
      ),
    },
    {
      label: 'Airfoils',
      component: (
        <AirfoilStep
          onSave={handleSave}
          onSaveAs={handleSaveAs}
          onLoad={openLoad}
        />
      ),
    },
    {
      label: 'Export',
      component: <ExportStep onOpenAuth={() => setShowAuth(true)} />,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <header
        style={{
          background: '#222',
          color: '#fff',
          padding: '1rem',
          borderBottom: '1px solid #333',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <ul
            style={{
              display: 'flex',
              listStyle: 'none',
              padding: 0,
              margin: 0,
              gap: '1rem',
              flex: 1,
            }}
          >
            {steps.map((step, index) => (
              <li key={step.label} style={{ flex: 1 }}>
                <button
                  type="button"
                  onClick={() => setCurrent(index)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: current === index ? '#646cff' : '#333',
                    color: 'inherit',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {step.label}
                </button>
              </li>
            ))}
          </ul>
          <div style={{ marginLeft: '1rem', position: 'relative' }}>
            {user ? (
              <UserMenu
                email={user.email}
                onSignOut={signOut}
                onShowDesigns={openLoad}
              />
            ) : (
              <button type="button" onClick={() => setShowAuth(true)}>
                Sign in
              </button>
            )}
          </div>
        </div>
      </header>
      <div style={{ flex: 1, overflow: 'auto' }}>{steps[current].component}</div>
      <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />
      {showLoad && (
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
          <div style={{ background: '#fff', padding: '1rem', width: '300px' }}>
            <h3>My Designs</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {designs.map((d) => (
                <li
                  key={d.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '0.5rem',
                    gap: '0.5rem',
                  }}
                >
                  {d.thumbnail && (
                    <img
                      src={d.thumbnail}
                      alt={d.name}
                      style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => loadDesign(d)}
                    style={{ flex: 1, textAlign: 'left' }}
                  >
                    {d.name}
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await deleteDesign(d.id);
                      setDesigns(designs.filter((x) => x.id !== d.id));
                    }}
                  >
                    X
                  </button>
                </li>
              ))}
            </ul>
            <button type="button" onClick={() => setShowLoad(false)} style={{ marginTop: '1rem' }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
