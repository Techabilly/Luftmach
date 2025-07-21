import React, { useState } from 'react';
import TemplateStep from './TemplateStep.jsx';
import BuildStep from './BuildStep.jsx';
import AirfoilStep from './AirfoilStep.jsx';
import ExportStep from './ExportStep.jsx';

export default function DesignFlow() {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { title: 'Templates', component: <TemplateStep /> },
    { title: 'Build', component: <BuildStep /> },
    { title: 'Airfoils', component: <AirfoilStep /> },
    { title: 'Export', component: <ExportStep /> },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <aside
        style={{
          width: '200px',
          borderRight: '1px solid #ccc',
          padding: '1rem',
          boxSizing: 'border-box',
          background: '#f8f8f8',
        }}
      >
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {steps.map((step, index) => (
            <li
              key={step.title}
              onClick={() => setCurrentStep(index)}
              style={{
                padding: '0.5rem',
                marginBottom: '0.25rem',
                cursor: 'pointer',
                background: index === currentStep ? '#eaeaea' : 'transparent',
                fontWeight: index === currentStep ? 'bold' : 'normal',
              }}
            >
              {index + 1}. {step.title}
            </li>
          ))}
        </ul>
      </aside>
      <main style={{ flex: 1, padding: '1rem', overflow: 'auto' }}>
        {steps[currentStep].component}
      </main>
    </div>
  );
}
