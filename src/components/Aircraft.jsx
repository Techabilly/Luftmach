import React from 'react';
import Fuselage from './Fuselage';
import Wing from './Wing';

export default function Aircraft({
  sections,
  span,
  sweep,
  mirrored,
  mountHeight,
  mountX,
  fuselageParams,
  groupRef,
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
      />
      <Wing
        sections={sections}
        span={span}
        sweep={sweep}
        mirrored={mirrored}
        mountHeight={mountHeight}
        mountX={mountX}
      />
    </group>
  );
}
