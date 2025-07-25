import React from 'react';
import Wing from './Wing';

export default function Elevator({
  rootSection,
  scale = 0.5,
  position = [0, 0, 0],
  wireframe = false,
}) {
  if (!rootSection) return null;

  const section = {
    ...rootSection,
    chord: rootSection.chord * scale,
    length: (rootSection.length || 0) * scale,
  };

  const sections = [section, { ...section }];

  return (
    <Wing
      sections={sections}
      sweep={0}
      mirrored
      mountHeight={position[1]}
      mountZ={position[2]}
      wireframe={wireframe}
      showNacelles={false}
    />
  );
}
