/* eslint react-refresh/only-export-components: "off" */
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

// Types are provided via JSDoc for IDE hints. Adjust as needed.
/**
 * @typedef {string} PartId
 * @typedef {Object} PartRegistryItem
 * @property {PartId} id
 * @property {string} label
 * @property {React.ComponentType<any>=} Component
 * @property {React.ComponentType<any>=} Controls
 * @property {Object=} defaults
 */

const STORAGE_KEY = 'luftmach.ui';

const UiContext = createContext(null);

export function UiProvider({ children }) {
  const [enabledParts, setEnabledParts] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      if (Array.isArray(saved.enabledParts) && saved.enabledParts.length) {
        return saved.enabledParts;
      }
      return ['wing'];
    } catch {
      return ['wing'];
    }
  });
  const [selectedPartId, setSelectedPartId] = useState(null);
  const [registry, setRegistry] = useState({});

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ...saved, enabledParts })
      );
    } catch {
      /* ignore */
    }
  }, [enabledParts]);

  const enablePart = (id) =>
    setEnabledParts((parts) => (parts.includes(id) ? parts : [...parts, id]));
  const disablePart = (id) =>
    setEnabledParts((parts) => parts.filter((p) => p !== id));
  const selectPart = (id) => setSelectedPartId(id);
  const registerParts = (items) =>
    setRegistry((r) => ({
      ...r,
      ...Object.fromEntries(items.map((i) => [i.id, i])),
    }));

  const value = useMemo(
    () => ({
      enabledParts,
      selectedPartId,
      registry,
      enablePart,
      disablePart,
      selectPart,
      registerParts,
      setEnabledParts,
    }),
    [enabledParts, selectedPartId, registry]
  );

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}

export function useUi() {
  const ctx = useContext(UiContext);
  if (!ctx) throw new Error('useUi must be used within UiProvider');
  return ctx;
}

export default UiContext;
