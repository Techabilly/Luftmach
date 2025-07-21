import React, { useState } from 'react';
//fw061n-codex/scaffold-multi-step-design-process-in-react
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
// pvttq8-codex/scaffold-multi-step-design-process-in-react
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
 main

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <aside
        style={{
          width: '200px',
// pvttq8-codex/scaffold-multi-step-design-process-in-react
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
main
            </li>
          ))}
        </ul>
      </aside>
// pvttq8-codex/scaffold-multi-step-design-process-in-react
      <main style={{ flex: 1, padding: '1rem' }}>
        <CurrentComponent />

      <main style={{ flex: 1, padding: '1rem', overflow: 'auto' }}>
        {steps[currentStep].component}
main
      </main>
main
    </div>
  );
}
