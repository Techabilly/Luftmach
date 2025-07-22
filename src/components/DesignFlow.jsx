import React, { useState } from 'react';
import TemplateStep from './steps/TemplateStep.jsx';
import BuildStep from './steps/BuildStep.jsx';
import AirfoilStep from './steps/AirfoilStep.jsx';
import ExportStep from './steps/ExportStep.jsx';

const steps = [
  { label: 'Templates', component: <TemplateStep /> },
  { label: 'Build', component: <BuildStep /> },
  { label: 'Airfoils', component: <AirfoilStep /> },
  { label: 'Export', component: <ExportStep /> },
];

export default function DesignFlow() {
  const [current, setCurrent] = useState(0);

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <nav
        style={{
          width: '200px',
          background: '#222',
          color: '#fff',
          padding: '1rem',
        }}
      >
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {steps.map((step, index) => (
            <li key={step.label} style={{ marginBottom: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setCurrent(index)}
                style={{
                  width: '100%',
                  padding: '0.5rem 1rem',
                  background: 'transparent',
                  color: 'inherit',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  borderLeft:
                    current === index ? '4px solid #646cff' : '4px solid transparent',
                }}
              >
                {step.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div style={{ flex: 1 }}>{steps[current].component}</div>
    </div>
  );
}
