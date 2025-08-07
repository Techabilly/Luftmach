import React from 'react';
import Fuselage from './Fuselage';
import Wing from './Wing';
import Rudder from './Rudder';
import Elevator from './Elevator';

export default function Aircraft({
  sections,
  sweep,
  mirrored,
  mountHeight,
  mountZ,
  fuselageParams,
  groupRef,
  wireframe = false,
  showFuselage = true,
  showNacelles = false,
  nacelleRadius = 10,
  nacelleLength = 40,
  showRudder = false,
  rudderHeight = 40,
  rootChord = 30,
  tipChord = 0,
  rudderSweep = 0,
  rudderThickness = 2,
  rudderOffset = 0,
  showElevator = false,
  elevatorRootChord = 50,
  elevatorTipChord = 50,
  elevatorSpan = 80,
  elevatorSweep = 0,
  elevatorDihedral = 0,
  elevatorThickness = 0.12,
  elevatorCamber = 0.02,
  elevatorCamberPos = 0.4,
  elevatorAngle = 0,
  elevatorOffset = 0,
}) {
  const tailCenterY =
    (0.5 - fuselageParams.verticalAlign) *
      (fuselageParams.frontHeight - fuselageParams.backHeight) +
    fuselageParams.tailHeight;

  return (
    <group ref={groupRef}>
      {showFuselage && (
        <Fuselage
          length={fuselageParams.length}
          frontWidth={fuselageParams.frontWidth}
          frontHeight={fuselageParams.frontHeight}
          backWidth={fuselageParams.backWidth}
          backHeight={fuselageParams.backHeight}
          cornerRadius={fuselageParams.cornerRadius}
          curveH={fuselageParams.curveH}
          curveV={fuselageParams.curveV}
          verticalAlign={fuselageParams.verticalAlign}
          tailHeight={fuselageParams.tailHeight}
          segmentCount={fuselageParams.segmentCount}
          debugCrossSections={fuselageParams.showCrossSections}
          wireframe={wireframe}
          closeNose={fuselageParams.closeNose}
          closeTail={fuselageParams.closeTail}
          nosecapLength={fuselageParams.nosecapLength}
          tailcapLength={fuselageParams.tailcapLength}
        />
      )}
      {showRudder && (
        <Rudder
          height={rudderHeight}
          rootChord={rootChord}
          tipChord={tipChord}
          sweep={rudderSweep}
          thickness={rudderThickness}
          offset={rudderOffset}
          wireframe={wireframe}
          position={[
            0,
            tailCenterY + fuselageParams.backHeight / 2,
            fuselageParams.length / 2,
          ]}
        />
      )}
      {showElevator && (
        <Elevator
          rootChord={elevatorRootChord}
          tipChord={elevatorTipChord}
          span={elevatorSpan}
          sweep={elevatorSweep}
          dihedral={elevatorDihedral}
          thickness={elevatorThickness}
          camber={elevatorCamber}
          camberPos={elevatorCamberPos}
          angle={elevatorAngle}
          wireframe={wireframe}
          offset={elevatorOffset}
          position={[0, tailCenterY, fuselageParams.length / 2]}
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
