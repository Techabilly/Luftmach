import React from 'react';
import Fuselage from './Fuselage';
import Wing from './Wing';
import Rudder from './Rudder';

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
  showRudder = false,
  rudderHeight = 40,
  rudderChord = 30,
  rudderThickness = 2,
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
        taperTop={fuselageParams.taperTop}
        taperBottom={fuselageParams.taperBottom}
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
      {showRudder && (
        <Rudder
          height={rudderHeight}
          chord={rudderChord}
          thickness={rudderThickness}
          wireframe={wireframe}
          position={[
            0,
            fuselageParams.tailHeight + fuselageParams.height / 2,
            fuselageParams.length / 2,
          ]}
        />
      )}
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
