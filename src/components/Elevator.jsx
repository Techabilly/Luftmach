import React from 'react';
import Wing from './Wing';

export default function Elevator({
  rootChord = 50,
  tipChord = 50,
  span = 80,
  sweep = 0,
  dihedral = 0,
  thickness = 0.12,
  camber = 0.02,
  camberPos = 0.4,
  angle = 0,
  position = [0, 0, 0],
  offset = 0,
  wireframe = false,
}) {
  const root = {
    chord: rootChord,
    thickness,
    camber,
    camberPos,
    angle,
    length: span,
    dihedral,
  };

  const tip = {
    chord: tipChord,
    thickness,
    camber,
    camberPos,
    angle,
    length: 0,
    dihedral,
  };

  const sections = [root, tip];

  return (
    <Wing
      sections={sections}
      sweep={sweep}
      mirrored
      mountHeight={position[1]}
      mountZ={position[2] + offset}
      wireframe={wireframe}
      showNacelles={false}
    />
  );
}
