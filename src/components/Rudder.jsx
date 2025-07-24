import React, { useMemo } from 'react';
import * as THREE from 'three';

export default function Rudder({ height = 40, chord = 30, thickness = 2, wireframe = false, position = [0,0,0] }) {
  const geom = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(chord, 0);
    shape.lineTo(0, height);
    shape.closePath();
    const g = new THREE.ExtrudeGeometry(shape, { depth: thickness, bevelEnabled: false });
    g.rotateY(Math.PI / 2);
    return g;
  }, [height, chord, thickness]);

  return (
    <mesh geometry={geom} position={position}>
      <meshStandardMaterial color="gray" side={THREE.DoubleSide} wireframe={wireframe} />
    </mesh>
  );
}
