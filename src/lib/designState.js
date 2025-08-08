import { levaStore } from 'leva';

export function getDesignState() {
  const data = levaStore.getData();
  const values = {};
  Object.entries(data).forEach(([key, entry]) => {
    values[key] = entry.value;
  });
  return values;
}

export function setDesignState(values) {
  if (!values) return;
  Object.entries(values).forEach(([key, value]) => {
    try {
      levaStore.setValueAtPath(key, value);
    } catch {
      /* ignore missing paths */
    }
  });
}
