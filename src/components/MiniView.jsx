import React, { useRef, useLayoutEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import * as THREE from 'three';

function FitToObject({ groupRef }) {
  const { camera, size } = useThree();
  useLayoutEffect(() => {
    if (!groupRef.current) return;
    const box = new THREE.Box3().setFromObject(groupRef.current);
    const sphere = box.getBoundingSphere(new THREE.Sphere());
    camera.lookAt(sphere.center);
    const zoom = Math.min(
      size.width / (sphere.radius * 2),
      size.height / (sphere.radius * 2),
    ) * 0.9;
    camera.zoom = zoom;
    camera.updateProjectionMatrix();
  }, [groupRef, camera, size]);
  return null;
}

export default function MiniView({ position, up, children, style }) {
  const groupRef = useRef();
  return (
    <div style={{ width: 200, height: 200, border: '1px solid #333', ...style }}>
      <Canvas orthographic camera={{ position, zoom: 1, up }} style={{ width: '100%', height: '100%' }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[1, 2, 3]} intensity={1} />
        <group ref={groupRef}>{children}</group>
        <FitToObject groupRef={groupRef} />
      </Canvas>
    </div>
  );
}
