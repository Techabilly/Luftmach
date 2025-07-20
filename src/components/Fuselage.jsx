import React, { useMemo } from 'react';
import * as THREE from 'three';

function createRoundedRectShape(width, height, radius) {
  const halfW = width / 2;
  const halfH = height / 2;
  const r = Math.min(radius, halfW, halfH);
  const shape = new THREE.Shape();
  shape.moveTo(-halfW + r, -halfH);
  shape.lineTo(halfW - r, -halfH);
  shape.quadraticCurveTo(halfW, -halfH, halfW, -halfH + r);
  shape.lineTo(halfW, halfH - r);
  shape.quadraticCurveTo(halfW, halfH, halfW - r, halfH);
  shape.lineTo(-halfW + r, halfH);
  shape.quadraticCurveTo(-halfW, halfH, -halfW, halfH - r);
  shape.lineTo(-halfW, -halfH + r);
  shape.quadraticCurveTo(-halfW, -halfH, -halfW + r, -halfH);
  return shape;
}

function createFuselageGeometry(
  length,
  width,
  taperH,
  taperV,
  taperPosH,
  taperPosV,
  cornerDiameter,
) {
  const radius = cornerDiameter / 2;

  const positions = [0];
  if (taperPosH > 0 && taperPosH < 1 && !positions.includes(taperPosH)) {
    positions.push(taperPosH);
  }
  if (taperPosV > 0 && taperPosV < 1 && !positions.includes(taperPosV)) {
    positions.push(taperPosV);
  }
  positions.push(1);
  positions.sort((a, b) => a - b);

  function scale(p, pos, taper) {
    if (pos >= 1) return p < 1 ? 1 : taper;
    if (p <= pos) return 1;
    return 1 + ((p - pos) / (1 - pos)) * (taper - 1);
  }

  const pointArrays = positions.map((p) => {
    const hScale = scale(p, taperPosH, taperH);
    const vScale = scale(p, taperPosV, taperV);
    const shape = createRoundedRectShape(
      width * hScale,
      width * vScale,
      radius * Math.min(hScale, vScale),
    );
    return shape.getPoints(32);
  });

  const vertices = [];
  const indices = [];
  let offset = 0;

  for (let s = 0; s < pointArrays.length - 1; s++) {
    const startX = -length / 2 + length * positions[s];
    const endX = -length / 2 + length * positions[s + 1];
    const start = pointArrays[s];
    const end = pointArrays[s + 1];

    for (let i = 0; i < start.length; i++) {
      vertices.push(startX, start[i].x, start[i].y);
      vertices.push(endX, end[i].x, end[i].y);
    }

    for (let i = 0; i < start.length - 1; i++) {
      const r1 = offset + 2 * i;
      const t1 = offset + 2 * i + 1;
      const r2 = offset + 2 * (i + 1);
      const t2 = offset + 2 * (i + 1) + 1;
      indices.push(r1, t1, r2);
      indices.push(t1, t2, r2);
    }
    const last = start.length - 1;
    indices.push(offset + 2 * last, offset + 2 * last + 1, offset);
    indices.push(offset + 2 * last + 1, offset + 1, offset);

    offset += start.length * 2;
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  return geom;
}

export default function Fuselage({
  length,
  width,
  taperH,
  taperV,
  taperPosH,
  taperPosV,
  cornerDiameter,
}) {
  const geom = useMemo(
    () =>
      createFuselageGeometry(
        length,
        width,
        taperH,
        taperV,
        taperPosH,
        taperPosV,
        cornerDiameter,
      ),
    [length, width, taperH, taperV, taperPosH, taperPosV, cornerDiameter]
  );

  return (
    <mesh geometry={geom}>
      <meshStandardMaterial color="gray" side={THREE.DoubleSide} />
    </mesh>
  );
}
