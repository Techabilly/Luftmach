import React from 'react';

export default function ViewControls({ pan, zoom, centerView }) {
  return (
    <div style={{
      position: 'absolute',
      top: 20,
      left: 20,
      zIndex: 10,
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      background: 'rgba(0,0,0,0.5)',
      padding: '8px',
      borderRadius: '4px'
    }}>
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
