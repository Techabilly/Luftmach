import React, { useState } from 'react';
import TemplateStep from './steps/TemplateStep.jsx';
import BuildStep from './steps/BuildStep.jsx';
import AirfoilStep from './steps/AirfoilStep.jsx';
import ExportStep from './steps/ExportStep.jsx';

const stepList = [
  { id: 0, label: 'Templates', component: <TemplateStep /> },
  { id: 1, label: 'Build', component: <BuildStep /> },
  { id: 2, label: 'Airfoils', component: <AirfoilStep /> },
  { id: 3, label: 'Export', component: <ExportStep /> },
];

export default function DesignFlow() {
  const [current, setCurrent] = useState(0);

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif' }}>
      <nav
        style={{
          width: '200px',
          borderRight: '1px solid #ddd',
          padding: '20px 0',
        }}
      >
        {stepList.map((step) => (
          <div
            key={step.id}
            onClick={() => setCurrent(step.id)}
            style={{
              padding: '10px 20px',
              cursor: 'pointer',
              background: current === step.id ? '#f0f0f0' : 'transparent',
              fontWeight: current === step.id ? 'bold' : 'normal',
            }}
          >
            {step.label}
          </div>
        ))}
      </nav>
      <main style={{ flex: 1 }}>{stepList[current].component}</main>
    </div>
  );
}
