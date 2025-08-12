import React, { useState } from 'react';
import TemplateStep from './TemplateStep.jsx';
import BuildStep from './BuildStep.jsx';
import AirfoilStep from './AirfoilStep.jsx';
import ExportStep from './ExportStep.jsx';

const steps = [
  { label: 'Templates', component: <TemplateStep /> },
  { label: 'Build', component: <BuildStep /> },
  { label: 'Airfoils', component: <AirfoilStep /> },
  { label: 'Export', component: <ExportStep /> },
];

export default function DesignFlow() {
  const [current, setCurrent] = useState(0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <header
        style={{
          background: 'var(--bg-color)',
          color: 'var(--text-color)',
          padding: '1rem',
          borderBottom: '1px solid var(--link-color)',
        }}
      >
        <ul
          style={{
            display: 'flex',
            listStyle: 'none',
            padding: 0,
            margin: 0,
            gap: '1rem',
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
                  background: current === index ? 'var(--link-color)' : 'var(--button-bg)',
                  color: 'var(--text-color)',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {step.label}
              </button>
            </li>
          ))}
        </ul>
      </header>
      <div style={{ flex: 1, overflow: 'auto' }}>{steps[current].component}</div>
    </div>
  );
}
