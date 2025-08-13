import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { UiProvider } from './ui/UiContext.jsx';

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <UiProvider>
      <App />
    </UiProvider>
  </React.StrictMode>
);
