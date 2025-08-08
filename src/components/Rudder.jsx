import React, { useMemo } from 'react';
import * as THREE from 'three';

export default function Rudder({
  height = 40,
  rootChord = 30,
  tipChord = 0,
  sweep = 0,
  thickness = 2,
  offset = 0,
  frontCornerRadius = 0,
  backCornerRadius = 0,
  wireframe = false,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}) {
  const geom = useMemo(() => {
    const shape = new THREE.Shape();

    const lead = (t) => sweep * t;
    const trail = (t) => rootChord + (sweep + tipChord - rootChord) * t;

    let fcr = Math.max(0, frontCornerRadius);
    let bcr = Math.max(0, backCornerRadius);
    const topWidth = trail(1) - lead(1);
    if (bcr > topWidth) bcr = topWidth;
    if (fcr > topWidth - bcr) fcr = topWidth - bcr;
    const limitedFcr = Math.min(fcr, height);
    const limitedBcr = Math.min(bcr, height);

    const trailingSweep = trail(1) - trail(0);
    const leadingSweep = lead(1) - lead(0);

    shape.moveTo(lead(0), 0);
    shape.lineTo(trail(0), 0);
    if (limitedBcr) {
      const bx = trail(1) - (limitedBcr * trailingSweep) / height;
      const by = height - limitedBcr;
      shape.lineTo(bx, by);
      shape.quadraticCurveTo(trail(1), height, trail(1) - limitedBcr, height);
    } else {
      shape.lineTo(trail(1), height);
    }
    shape.lineTo(lead(1) + limitedFcr, height);
    if (limitedFcr) {
      const fx = lead(1) - (limitedFcr * leadingSweep) / height;
      const fy = height - limitedFcr;
      shape.quadraticCurveTo(lead(1), height, fx, fy);
    } else {
      shape.lineTo(lead(1), height);
    }
    shape.lineTo(lead(0), 0);
    shape.closePath();

    const g = new THREE.ExtrudeGeometry(shape, { depth: thickness, bevelEnabled: false });
    g.rotateY(Math.PI / 2);
    g.translate(-thickness / 2, 0, 0);
    return g;
  }, [height, rootChord, tipChord, sweep, thickness, frontCornerRadius, backCornerRadius]);

  const finalPos = [position[0], position[1], position[2] + offset];

  return (
    <mesh geometry={geom} position={finalPos} rotation={rotation}>
      <meshStandardMaterial color="gray" side={THREE.DoubleSide} wireframe={wireframe} />
    </mesh>
  );
}
