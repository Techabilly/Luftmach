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
  showNacelles = false,
  nacelleRadius = 10,
  nacelleLength = 40,
}) {
  return (
    <group ref={groupRef}>
      <Fuselage
        length={fuselageParams.length}
        width={fuselageParams.width}
        height={fuselageParams.height}
        topShape={fuselageParams.topShape}
        bottomShape={fuselageParams.bottomShape}
        taperH={fuselageParams.taperH}
        taperV={fuselageParams.taperV}
        taperPosH={fuselageParams.taperPosH}
        taperPosV={fuselageParams.taperPosV}
        cornerDiameter={fuselageParams.cornerDiameter}
        curveH={fuselageParams.curveH}
        curveV={fuselageParams.curveV}
        tailHeight={fuselageParams.tailHeight}
        wireframe={wireframe}
        closeNose={fuselageParams.closeNose}
        closeTail={fuselageParams.closeTail}
        nosecapLength={fuselageParams.nosecapLength}
        nosecapSharpness={fuselageParams.nosecapSharpness}
        tailcapLength={fuselageParams.nosecapLength}
        tailcapSharpness={fuselageParams.nosecapSharpness}
      />
      <Wing
        sections={sections}
        sweep={sweep}
        mirrored={mirrored}
        mountHeight={mountHeight}
        mountZ={mountZ}
        showNacelles={showNacelles}
        nacelleRadius={nacelleRadius}
        nacelleLength={nacelleLength}
        wireframe={wireframe}
      />
    </group>
  );
}
