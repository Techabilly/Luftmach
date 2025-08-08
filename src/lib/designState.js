import { levaStore } from 'leva';

export function getDesignState() {
  const data = levaStore.getData();
  const values = {};
  Object.entries(data).forEach(([key, entry]) => {
    values[key] = entry.value;
  });
  return values;
}

export function getDesignThumbnail() {
  const canvas = document.querySelector('canvas');
  if (!canvas) return null;
  try {
    return canvas.toDataURL('image/png');
  } catch {
    return null;
  }
}
