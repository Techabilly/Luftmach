import React from 'react';
import { Canvas } from '@react-three/fiber';

export default function MiniView({ position, up, children, style }) {
  return (
    <div style={{ width: 200, height: 200, border: '1px solid #333', ...style }}>
      <Canvas orthographic camera={{ position, zoom: 1, up }} style={{ width: '100%', height: '100%' }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[1, 2, 3]} intensity={1} />
        {children}
      </Canvas>
    </div>
  );
}
