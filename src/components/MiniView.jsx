import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

export default function MiniView({ children, position = [0, 0, 0], up = [0, 1, 0] }) {
  return (
    <div style={{ width: 120, height: 120, border: '1px solid var(--link-color)' }}>
      <Canvas camera={{ position, up }} style={{ width: '100%', height: '100%' }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[100, 100, 100]} intensity={0.5} />
        {children}
        <OrbitControls enablePan={false} enableZoom={false} enableRotate={false} />
      </Canvas>
    </div>
  );
}
