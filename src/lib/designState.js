import { levaStore } from 'leva';

export function getDesignState() {
  const data = levaStore.getData();
  const values = {};
  Object.entries(data).forEach(([key, entry]) => {
    values[key] = entry.value;
  });
  return values;
}
codex/add-thumbnail-to-saved-designs
export function getDesignThumbnail() {
  const canvas = document.querySelector('canvas');
  if (!canvas) return null;
  try {
    return canvas.toDataURL('image/png');
  } catch {
    return null;
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
main
}
