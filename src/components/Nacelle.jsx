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

  // Determine which side of the aircraft the nacelle is on so fin angles can be mirrored
  const side = position[0] < 0 ? -1 : 1;

  const topAngleDeg = (topFinAngle ?? finAngle) * side;
  const bottomAngleDeg = (bottomFinAngle ?? finAngle) * side;
  const topAngleRad = (topAngleDeg * Math.PI) / 180;
  const bottomAngleRad = (bottomAngleDeg * Math.PI) / 180;

  // Compute the slope of the nacelle's top and bottom surfaces so fins mount flush
  const topFront = frontHeight / 2;
  const topBack =
    backHeight / 2 + (0.5 - verticalAlign) * (frontHeight - backHeight) + tailHeight;
  const bottomFront = -frontHeight / 2;
  const bottomBack =
    -backHeight / 2 + (0.5 - verticalAlign) * (frontHeight - backHeight) + tailHeight;
  const topSlopeRad = Math.atan2(topBack - topFront, length);
  const bottomSlopeRad = Math.atan2(bottomBack - bottomFront, length);

  const fins = [];
  if (topFin) {
    fins.push(
      <group position={[0, topY, 0]} rotation={[topSlopeRad, 0, topAngleRad]} key="top">
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
        />
      </group>,
    );
  }
  if (bottomFin) {
    fins.push(
      <group
        position={[0, bottomY, 0]}
        rotation={[Math.PI - bottomSlopeRad, 0, -bottomAngleRad]}
        key="bottom"
      >
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
