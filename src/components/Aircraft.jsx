import React from 'react';
import Fuselage from './Fuselage';
import Wing from './Wing';

export default function Aircraft({
  sections,
  sweep,
  mirrored,
  mountHeight,
  mountX,
  fuselageParams,
  groupRef,
  wireframe = false,
}) {
  return (
    <group ref={groupRef}>
      <Fuselage
        length={fuselageParams.length}
        width={fuselageParams.width}
        taperH={fuselageParams.taperH}
        taperV={fuselageParams.taperV}
        taperPosH={fuselageParams.taperPosH}
        taperPosV={fuselageParams.taperPosV}
        cornerDiameter={fuselageParams.cornerDiameter}
        curveH={fuselageParams.curveH}
        curveV={fuselageParams.curveV}
        tailHeight={fuselageParams.tailHeight}
        noseLength={fuselageParams.noseLength}
        wireframe={wireframe}
      />
      <Wing
        sections={sections}
        sweep={sweep}
        mirrored={mirrored}
        mountHeight={mountHeight}
        mountX={mountX}
        wireframe={wireframe}
      />
    </group>
  );
}
