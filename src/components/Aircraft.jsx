import React from 'react';
import Fuselage from './Fuselage';
import Wing from './Wing';

export default function Aircraft({
  sections,
  sweep,
  mirrored,
  mountHeight,
  mountZ,
  fuselageParams,
  groupRef,
  wireframe = false,
}) {
  return (
    <group ref={groupRef}>
      <Fuselage
        length={fuselageParams.length}
        width={fuselageParams.width}
        height={fuselageParams.height}
        shape={fuselageParams.shape}
        taperH={fuselageParams.taperH}
        taperV={fuselageParams.taperV}
        taperPosH={fuselageParams.taperPosH}
        taperPosV={fuselageParams.taperPosV}
        cornerDiameter={fuselageParams.cornerDiameter}
        curveH={fuselageParams.curveH}
        curveV={fuselageParams.curveV}
        tailHeight={fuselageParams.tailHeight}
        wireframe={wireframe}
      />
      <Wing
        sections={sections}
        sweep={sweep}
        mirrored={mirrored}
        mountHeight={mountHeight}
        mountZ={mountZ}
        wireframe={wireframe}
      />
    </group>
  );
}
