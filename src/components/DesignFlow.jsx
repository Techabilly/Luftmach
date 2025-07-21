import React, { useState } from 'react';
import TemplateStep from './TemplateStep';
import BuildStep from './BuildStep';
import AirfoilStep from './AirfoilStep';
import ExportStep from './ExportStep';

const stepComponents = [
  { label: 'Templates', component: TemplateStep },
  { label: 'Build', component: BuildStep },
  { label: 'Airfoils', component: AirfoilStep },
  { label: 'Export', component: ExportStep },
];

export default function DesignFlow() {
  const [currentStep, setCurrentStep] = useState(0);
  const CurrentComponent = stepComponents[currentStep].component;

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <aside
        style={{
          width: '200px',
          background: '#222',
          color: '#fff',
          padding: '1rem',
        }}
      >
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {stepComponents.map((step, index) => (
            <li key={step.label} style={{ marginBottom: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setCurrentStep(index)}
                style={{
                  width: '100%',
                  padding: '0.5rem 1rem',
                  background: 'none',
                  border: 'none',
                  color: index === currentStep ? '#61dafb' : '#fff',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                {step.label}
              </button>
            </li>
          ))}
        </ul>
      </aside>
      <main style={{ flex: 1, padding: '1rem' }}>
        <CurrentComponent />
      </main>
    </div>
  );
}
