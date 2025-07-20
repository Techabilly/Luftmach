import React from 'react';
import { useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

export default function ViewControls({ controls, targetGroup }) {
  const { camera } = useThree();
  const step = 20;

const pan = (dx, dy) => {
  if (!controls.current) return;

  const direction = new THREE.Vector3();
  const up = new THREE.Vector3();
  const right = new THREE.Vector3();

  // Get camera basis vectors
  camera.getWorldDirection(direction);
  up.copy(camera.up).normalize();
  right.crossVectors(direction, up).normalize();

  // Pan relative to camera view
  const panOffset = new THREE.Vector3()
    .addScaledVector(right, dx * step)
    .addScaledVector(up, dy * step);

  camera.position.add(panOffset);
  controls.current.target.add(panOffset);
  controls.current.update();
};


  const zoom = (factor) => {
    const center = controls.current ? controls.current.target : new THREE.Vector3();
    camera.position.sub(center).multiplyScalar(factor).add(center);
    if (controls.current) controls.current.update();
  };

  const centerView = () => {
    if (!targetGroup.current) return;
    const box = new THREE.Box3().setFromObject(targetGroup.current);
    const c = new THREE.Vector3();
    box.getCenter(c);
    const offset = new THREE.Vector3().subVectors(camera.position, controls.current.target);
    controls.current.target.copy(c);
    camera.position.copy(c.clone().add(offset));
    controls.current.update();
  };

  return (
    <Html fullscreen>
      <div style={{ position: 'absolute', top: 20, left: 20, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
          <button onClick={() => pan(0, 1)}>▲</button>
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button onClick={() => pan(-1, 0)}>◀</button>
          <button onClick={centerView}>Center</button>
          <button onClick={() => pan(1, 0)}>▶</button>
        </div>
        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
          <button onClick={() => pan(0, -1)}>▼</button>
        </div>
        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
          <button onClick={() => zoom(0.8)}>+</button>
          <button onClick={() => zoom(1.25)}>-</button>
        </div>
      </div>
    </Html>
  );
}
