import React, { useMemo } from 'react';
import * as THREE from 'three';

export default function Nacelle({ length = 40, radius = 10, position = [0, 0, 0], wireframe = false }) {
  const geom = useMemo(() => new THREE.CylinderGeometry(radius, radius, length, 16), [radius, length]);
  return (
    <mesh geometry={geom} position={position} rotation={[Math.PI / 2, 0, 0]}>
      <meshStandardMaterial color="silver" side={THREE.DoubleSide} wireframe={wireframe} />
    </mesh>
  );
}
