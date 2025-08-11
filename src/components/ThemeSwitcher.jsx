import React from 'react';

export default function ThemeSwitcher({ color, setColor }) {
  const update = (key) => (e) => setColor({ ...color, [key]: Number(e.target.value) });
  const sliderStyle = { width: '100%' };
  const containerStyle = {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1000,
    background: 'var(--bg-color)',
    padding: '10px',
    borderRadius: '8px',
    color: 'var(--text-color)',
  };
  return (
    <div style={containerStyle}>
      <label>
        Hue: {color.h}
        <input
          type="range"
          min="0"
          max="360"
          value={color.h}
          onChange={update('h')}
          style={sliderStyle}
        />
      </label>
      <label>
        Saturation: {color.s}
        <input
          type="range"
          min="0"
          max="100"
          value={color.s}
          onChange={update('s')}
          style={sliderStyle}
        />
      </label>
      <label>
        Value: {color.v}
        <input
          type="range"
          min="0"
          max="100"
          value={color.v}
          onChange={update('v')}
          style={sliderStyle}
        />
      </label>
    </div>
  );
}
