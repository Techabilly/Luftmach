import React from 'react';
import Fuselage from './Fuselage';
import Rudder from './Rudder';

export default function Nacelle({
  position = [0, 0, 0],
  wireframe = false,
  topFin = false,
  bottomFin = false,
  finAngle = 45,
  topFinAngle,
  bottomFinAngle,
  length = 40,
  frontWidth = 20,
  frontHeight = 20,
  backWidth = 20,
  backHeight = 20,
  cornerRadius = 0,
  curveH = 1,
  curveV = 1,
  verticalAlign = 0.5,
  tailHeight = 0,
  closeNose = false,
  closeTail = false,
  nosecapLength = 0,
  tailcapLength = 0,
  segmentCount = 20,
  finHeight = 10,
  finRootChord = 15,
  finTipChord = 0,
  finSweep = 0,
  finThickness = 1,
  finOffset = 0,
  finFrontCornerRadius = 0,
  finBackCornerRadius = 0,
}) {
  const body = (
    <Fuselage
      length={length}
      frontWidth={frontWidth}
      frontHeight={frontHeight}
      backWidth={backWidth}
      backHeight={backHeight}
      cornerRadius={cornerRadius}
      curveH={curveH}
      curveV={curveV}
      verticalAlign={verticalAlign}
      tailHeight={tailHeight}
      closeNose={closeNose}
      closeTail={closeTail}
      nosecapLength={nosecapLength}
      tailcapLength={tailcapLength}
      segmentCount={segmentCount}
      wireframe={wireframe}
      debugCrossSections={false}
      color="silver"
    />
  );

  const nacelleMaxHeight = Math.max(frontHeight, backHeight);
  const centerY = (0.5 - verticalAlign) * (frontHeight - backHeight) + tailHeight;
  const topY = centerY + nacelleMaxHeight / 2;
  const bottomY = centerY - nacelleMaxHeight / 2;

  const topAngleDeg = topFinAngle ?? finAngle;
  const bottomAngleDeg = bottomFinAngle ?? -finAngle;
  const topAngleRad = (topAngleDeg * Math.PI) / 180;
  const bottomAngleRad = (bottomAngleDeg * Math.PI) / 180;

  const fins = [];
  if (topFin) {
    fins.push(
      <group rotation={[0, 0, topAngleRad]} key="top">
        <Rudder
          height={finHeight}
          rootChord={finRootChord}
          tipChord={finTipChord}
          sweep={finSweep}
          thickness={finThickness}
          offset={finOffset}
          frontCornerRadius={finFrontCornerRadius}
          backCornerRadius={finBackCornerRadius}
          wireframe={wireframe}
          position={[0, topY, 0]}
        />
      </group>,
    );
  }
  if (bottomFin) {
    fins.push(
      <group rotation={[0, 0, bottomAngleRad]} key="bottom">
        <Rudder
          height={finHeight}
          rootChord={finRootChord}
          tipChord={finTipChord}
          sweep={finSweep}
          thickness={finThickness}
          offset={finOffset}
          frontCornerRadius={finFrontCornerRadius}
          backCornerRadius={finBackCornerRadius}
          wireframe={wireframe}
          position={[0, bottomY, 0]}
          rotation={[Math.PI, 0, 0]}
        />
      </group>,
    );
  }

  return (
    <group position={position}>
      {body}
      {fins}
    </group>
  );
}
