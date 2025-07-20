import React, { useMemo } from 'react';
import * as THREE from 'three';

function createRoundedRectShape(size, radius) {
  const half = size / 2;
  const r = Math.min(radius, half);
  const shape = new THREE.Shape();
  shape.moveTo(-half + r, -half);
  shape.lineTo(half - r, -half);
  shape.quadraticCurveTo(half, -half, half, -half + r);
  shape.lineTo(half, half - r);
  shape.quadraticCurveTo(half, half, half - r, half);
  shape.lineTo(-half + r, half);
  shape.quadraticCurveTo(-half, half, -half, half - r);
  shape.lineTo(-half, -half + r);
  shape.quadraticCurveTo(-half, -half, -half + r, -half);
  return shape;
}

function createFuselageGeometry(length, width, taper, cornerDiameter) {
  const radius = cornerDiameter / 2;
  const tailShape = createRoundedRectShape(width, radius);
  const noseShape = createRoundedRectShape(width * taper, radius * taper);
  const tail = tailShape.getPoints(32);
  const nose = noseShape.getPoints(32);

  const vertices = [];
  const indices = [];
  const startX = -length / 2;
  const endX = length / 2;

  for (let i = 0; i < tail.length; i++) {
    const tp = tail[i];
    const np = nose[i];
    vertices.push(startX, tp.x, tp.y);
    vertices.push(endX, np.x, np.y);
  }

  for (let i = 0; i < tail.length - 1; i++) {
    const r1 = 2 * i;
    const t1 = 2 * i + 1;
    const r2 = 2 * (i + 1);
    const t2 = 2 * (i + 1) + 1;
    indices.push(r1, t1, r2);
    indices.push(t1, t2, r2);
  }
  const last = tail.length - 1;
  indices.push(2 * last, 2 * last + 1, 0);
  indices.push(2 * last + 1, 1, 0);

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  return geom;
}

export default function Fuselage({ length, width, taper, cornerDiameter }) {
  const geom = useMemo(
    () => createFuselageGeometry(length, width, taper, cornerDiameter),
    [length, width, taper, cornerDiameter]
  );

  return (
    <mesh geometry={geom}>
      <meshStandardMaterial color="gray" side={THREE.DoubleSide} />
    </mesh>
  );
}
