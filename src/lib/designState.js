import { levaStore } from 'leva';

export function getDesignState() {
  const data = levaStore.getData();
  const values = {};
  Object.entries(data).forEach(([key, entry]) => {
    values[key] = entry.value;
  });
  return values;
}
