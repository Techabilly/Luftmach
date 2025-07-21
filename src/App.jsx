
import React, { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Leva } from 'leva';
import './App.css';
import AirfoilPreview from './components/AirfoilPreview';
import Aircraft from './components/Aircraft';
import MiniView from './components/MiniView';

export default function App() {
  const controlsRef = useRef();
  const groupRef = useRef();
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
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[1, 2, 3]} intensity={1} />
          <Aircraft groupRef={groupRef} />
          <OrbitControls ref={controlsRef} />
        </Canvas>

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
