import React, { useMemo } from 'react';
import * as THREE from 'three';

export default function Rudder({
  height = 40,
  rootChord = 30,
  tipChord = 0,
  thickness = 2,
  frontCurve = 1,
  backCurve = 1,
  wireframe = false,
  position = [0, 0, 0],
}) {
  const geom = useMemo(() => {
    const shape = new THREE.Shape();
    const segments = 20;

    const backX = (t) => rootChord + (tipChord - rootChord) * Math.pow(t, backCurve);
    const frontX = (t) => -(rootChord - tipChord) * Math.pow(t, frontCurve);

    shape.moveTo(frontX(0), 0);
    shape.lineTo(backX(0), 0);
    for (let i = 1; i <= segments; i++) {
      const t = i / segments;
      shape.lineTo(backX(t), height * t);
    }
    for (let i = segments; i >= 0; i--) {
      const t = i / segments;
      shape.lineTo(frontX(t), height * t);
    }
    shape.closePath();

    const g = new THREE.ExtrudeGeometry(shape, { depth: thickness, bevelEnabled: false });
    g.rotateY(Math.PI / 2);
    return g;
  }, [height, rootChord, tipChord, thickness, frontCurve, backCurve]);

  return (
    <mesh geometry={geom} position={position}>
      <meshStandardMaterial color="gray" side={THREE.DoubleSide} wireframe={wireframe} />
    </mesh>
  );
}
