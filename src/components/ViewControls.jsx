import React from 'react';
import { useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

export default function ViewControls({ controls, targetGroup }) {
  const { camera } = useThree();
  const step = 20;
  const angleStep = THREE.MathUtils.degToRad(15);

  const slide = (dir) => {
    camera.position.x += dir * step;
    if (controls.current) {
      controls.current.target.x += dir * step;
      controls.current.update();
    }
  };

  const rotate = () => {
    const center = controls.current ? controls.current.target : new THREE.Vector3();
    camera.position.sub(center);
    camera.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), angleStep);
    camera.position.add(center);
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
      <div style={{ position: 'absolute', bottom: 20, left: 20, display: 'flex', gap: '8px' }}>
        <button onClick={() => slide(-1)}>◀</button>
        <button onClick={centerView}>Center</button>
        <button onClick={() => slide(1)}>▶</button>
        <button onClick={rotate}>⟳</button>
      </div>
    </Html>
  );
}
