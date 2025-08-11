import React from 'react';
import * as THREE from 'three';

export default function ViewControls({ controls, targetGroup }) {
  const step = 20;

  const getCamera = () => (controls.current ? controls.current.object : null);

  const pan = (dx, dy) => {
    const camera = getCamera();
    if (!camera || !controls.current) return;
    camera.position.x += dx * step;
    camera.position.y += dy * step;
    controls.current.target.x += dx * step;
    controls.current.target.y += dy * step;
    controls.current.update();
  };

  const zoom = (factor) => {
    const camera = getCamera();
    if (!camera || !controls.current) return;
    const center = controls.current.target.clone();
    camera.position.sub(center).multiplyScalar(factor).add(center);
    controls.current.update();
  };

  const centerView = () => {
    const camera = getCamera();
    if (!camera || !controls.current || !targetGroup.current) return;
    const box = new THREE.Box3().setFromObject(targetGroup.current);
    const c = new THREE.Vector3();
    box.getCenter(c);
    const offset = new THREE.Vector3().subVectors(camera.position, controls.current.target);
    controls.current.target.copy(c);
    camera.position.copy(c.clone().add(offset));
    controls.current.update();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
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
  );
}
