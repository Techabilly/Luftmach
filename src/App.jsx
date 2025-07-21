
import React, { useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useControls, Leva } from 'leva';
import * as THREE from 'three';
import './App.css';
import AirfoilPreview from './components/AirfoilPreview';
import ViewControls from './components/ViewControls_window_locked';
import Aircraft from './components/Aircraft';
import MiniView from './components/MiniView';

export default function App() {
  const controlsRef = useRef();
  const groupRef = useRef();

  const camera = useRef();

  const step = 20;

  const pan = (dx, dy) => {
    if (!controlsRef.current || !camera.current) return;

    const direction = new THREE.Vector3();
    const up = new THREE.Vector3();
    const right = new THREE.Vector3();

    camera.current.getWorldDirection(direction);
    up.copy(camera.current.up).normalize();
    right.crossVectors(direction, up).normalize();

    const panOffset = new THREE.Vector3()
      .addScaledVector(right, dx * step)
      .addScaledVector(up, dy * step);

    camera.current.position.add(panOffset);
    controlsRef.current.target.add(panOffset);
    controlsRef.current.update();
  };

  const zoom = (factor) => {
    const center = controlsRef.current ? controlsRef.current.target : new THREE.Vector3();
    camera.current.position.sub(center).multiplyScalar(factor).add(center);
    controlsRef.current.update();
  };

  const centerView = () => {
    if (!groupRef.current || !controlsRef.current || !camera.current) return;
    const box = new THREE.Box3().setFromObject(groupRef.current);
    const c = new THREE.Vector3();
    box.getCenter(c);
    const offset = new THREE.Vector3().subVectors(camera.current.position, controlsRef.current.target);
    controlsRef.current.target.copy(c);
    camera.current.position.copy(c.clone().add(offset));
    controlsRef.current.update();
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <div style={{
        width: '340px',
        backgroundColor: '#181818',
        padding: '10px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        borderRight: '1px solid #333',
        overflowY: 'auto'
      }}>
        <Leva collapsed={false} fill theme={{ colors: { elevation1: '#222' } }} />
        {/* AirfoilPreviews go here */}
      </div>

      <div style={{ flex: 1, position: 'relative', height: '100%' }}>
        <Canvas
          style={{ width: '100%', height: '100%' }}
          camera={{ position: [0, 0, 400], fov: 50 }}
          onCreated={({ camera: cam }) => (camera.current = cam)}
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[1, 2, 3]} intensity={1} />
          <Aircraft groupRef={groupRef} />
          <OrbitControls ref={controlsRef} />
        </Canvas>

        <ViewControls pan={pan} zoom={zoom} centerView={centerView} />

        <div
          style={{
            position: 'absolute',
            bottom: 20,
            left: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <MiniView position={[0, 0, 400]} up={[0, 1, 0]}>
            <Aircraft groupRef={groupRef} wireframe />
          </MiniView>
          <MiniView position={[0, 400, 0]} up={[0, 0, 1]}>
            <Aircraft groupRef={groupRef} wireframe />
          </MiniView>
        </div>
      </div>
    </div>
  );
}
