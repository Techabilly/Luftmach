import React from 'react';
import * as THREE from 'three';

function createAirfoilPoints(chord, thickness, camber, camberPos, resolution = 50) {
  const x = Array.from({ length: resolution }, (_, i) => i / (resolution - 1));
  const yt = x.map(xi =>
    5 * thickness * (
      0.2969 * Math.sqrt(xi) -
      0.1260 * xi -
      0.3516 * xi ** 2 +
      0.2843 * xi ** 3 -
      0.1015 * xi ** 4
    )
  );

  const yc = x.map(xi => {
    if (xi < camberPos) {
      return camber / (camberPos ** 2) * (2 * camberPos * xi - xi ** 2);
    } else {
      return camber / ((1 - camberPos) ** 2) * ((1 - 2 * camberPos) + 2 * camberPos * xi - xi ** 2);
    }
  });

  const dyc_dx = x.map(xi => {
    if (xi < camberPos) {
      return (2 * camber / (camberPos ** 2)) * (camberPos - xi);
    } else {
      return (2 * camber / ((1 - camberPos) ** 2)) * (camberPos - xi);
    }
  });

  const theta = dyc_dx.map(dy => Math.atan(dy));

  const xu = x.map((xi, i) => xi - yt[i] * Math.sin(theta[i]));
  const yu = x.map((_, i) => yc[i] + yt[i] * Math.cos(theta[i]));

  const xl = x.map((xi, i) => xi + yt[i] * Math.sin(theta[i]));
  const yl = x.map((_, i) => yc[i] - yt[i] * Math.cos(theta[i]));

  const top = xu.map((x, i) => [x * chord, yu[i] * chord]);
  const bottom = xl.slice().reverse().map((x, i) => [x * chord, yl.slice().reverse()[i] * chord]);

  return [...top, ...bottom];
}

export default function AirfoilPreview({ chord, thickness, camber, camberPos, label }) {
  const points = createAirfoilPoints(chord, thickness, camber, camberPos);
  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(2)} ${-p[1].toFixed(2)}`).join(' ');

  const padding = 20;
  const width = chord + padding * 2;
  const height = chord * 0.2 + padding * 2;
  const viewBox = `${-padding} ${-height / 2} ${width} ${height}`;

  const inchSpacing = 25.4; // 1 inch in mm
  const numGridLines = Math.floor(chord / inchSpacing);

  const gridLines = Array.from({ length: numGridLines + 1 }, (_, i) => i * inchSpacing);

  return (
    <div style={{ marginTop: '16px', width: '100%' }}>
      <div style={{ color: 'white', marginBottom: '4px' }}>{label} (inches)</div>
      <svg viewBox={viewBox} width="100%" height="100" preserveAspectRatio="xMidYMid meet">
        {/* Grid lines */}
        {gridLines.map((x, i) => (
          <line
            key={i}
            x1={x}
            y1={-height / 2}
            x2={x}
            y2={height / 2}
            stroke="#444"
            strokeDasharray="2,2"
          />
        ))}

        {/* Airfoil path */}
        <path d={pathData} stroke="cyan" fill="none" strokeWidth="1" />

        {/* Chord edge lines */}
        <line x1={0} y1={-height / 2} x2={0} y2={height / 2} stroke="gray" strokeDasharray="4,2" />
        <line x1={chord} y1={-height / 2} x2={chord} y2={height / 2} stroke="gray" strokeDasharray="4,2" />
      </svg>
    </div>
  );
}
