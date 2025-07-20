import React from 'react';
import { useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

export default function ViewControls({ controls, targetGroup }) {
  const { camera } = useThree();
  const step = 20;

  const pan = (dx, dy) => {
    camera.position.x += dx * step;
    camera.position.y += dy * step;
    if (controls.current) {
      controls.current.target.x += dx * step;
      controls.current.target.y += dy * step;
      controls.current.update();
    }
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
    <Html prepend>
      <div style={{ position: 'absolute', bottom: 20, left: 20, display: 'flex', flexDirection: 'column', gap: '4px' }}>
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
