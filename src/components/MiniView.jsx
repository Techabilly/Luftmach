import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

export default function MiniView({ children, position = [0, 0, 0], up = [0, 1, 0] }) {
  return (
    <div style={{ width: 120, height: 120, border: '1px solid #333' }}>
      <Canvas camera={{ position, up }} style={{ width: '100%', height: '100%' }}>
        {children}
        <OrbitControls enablePan={false} enableZoom={false} enableRotate={false} />
      </Canvas>
    </div>
  );
}
