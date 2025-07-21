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

function createEllipseShape(width, height) {
  const shape = new THREE.Shape();
  shape.absellipse(0, 0, width / 2, height / 2, 0, Math.PI * 2, false, 0);
  return shape;
}

function createFuselageGeometry(
  length,
  width,
  height,
  taperH,
  taperV,
  taperPosH,
  taperPosV,
  cornerDiameter,
  curveH,
  curveV,
  tailHeight = 0,
  shape = 'Square',
) {
  const radius = cornerDiameter / 2;

  // Sample several positions along the fuselage so taper transitions
  // form smooth curves instead of a single angled segment.
  const segments = 20;
  const positions = Array.from({ length: segments + 1 }, (_, i) => i / segments);

  function scale(p, pos, taper, curve) {
    if (pos >= 1) return p < 1 ? 1 : taper;
    if (p <= pos) return 1;
    const t = (p - pos) / (1 - pos);
    const curved = Math.pow(t, curve);
    const s = 1 + curved * (taper - 1);
    return Math.max(s, 0.001); // prevent zero scale which can crash geometry
  }

  const pointArrays = positions.map((p) => {
    const hScale = scale(p, taperPosH, taperH, curveH);
    const vScale = scale(p, taperPosV, taperV, curveV);
    let cross;
    if (shape === 'Ellipse') {
      cross = createEllipseShape(width * hScale, height * vScale);
    } else {
      cross = createRoundedRectShape(
        width * hScale,
        height * vScale,
        radius * Math.min(hScale, vScale),
      );
    }
    return cross.getPoints(32);
  });

  const vertices = [];
  const indices = [];
  let offset = 0;

  for (let s = 0; s < pointArrays.length - 1; s++) {
    const startPos = -length / 2 + length * positions[s];
    const endPos = -length / 2 + length * positions[s + 1];
    const startYOffset = tailHeight * positions[s];
    const endYOffset = tailHeight * positions[s + 1];
    const start = pointArrays[s];
    const end = pointArrays[s + 1];

    for (let i = 0; i < start.length; i++) {
      vertices.push(start[i].x, start[i].y + startYOffset, startPos);
      vertices.push(end[i].x, end[i].y + endYOffset, endPos);
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

  // Close the front of the fuselage
  const front = pointArrays[0];
  const frontPos = -length / 2 + length * positions[0];
  const frontYOffset = tailHeight * positions[0];
  const frontStart = vertices.length / 3;
  for (let i = 0; i < front.length; i++) {
    vertices.push(front[i].x, front[i].y + frontYOffset, frontPos);
  }
  const frontCenter = vertices.length / 3;
  vertices.push(0, frontYOffset, frontPos);
  for (let i = 0; i < front.length; i++) {
    const v1 = frontStart + i;
    const v2 = frontStart + ((i + 1) % front.length);
    indices.push(v1, v2, frontCenter);
  }

  // Close the back of the fuselage
  const back = pointArrays[pointArrays.length - 1];
  const backPos = -length / 2 + length * positions[positions.length - 1];
  const backYOffset = tailHeight * positions[positions.length - 1];
  const backStart = vertices.length / 3;
  for (let i = 0; i < back.length; i++) {
    vertices.push(back[i].x, back[i].y + backYOffset, backPos);
  }
  const backCenter = vertices.length / 3;
  vertices.push(0, backYOffset, backPos);
  for (let i = 0; i < back.length; i++) {
    const v1 = backStart + i;
    const v2 = backStart + ((i + 1) % back.length);
    indices.push(v2, v1, backCenter);
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
  height,
  taperH,
  taperV,
  taperPosH,
  taperPosV,
  cornerDiameter,
  curveH = 1,
  curveV = 1,
  tailHeight = 0,
  shape = 'Square',
  wireframe = false,
}) {
  const geom = useMemo(
    () =>
      createFuselageGeometry(
        length,
        width,
        height,
        taperH,
        taperV,
        taperPosH,
        taperPosV,
        cornerDiameter,
        curveH,
        curveV,
        tailHeight,
        shape,
      ),
    [
      length,
      width,
      height,
      taperH,
      taperV,
      taperPosH,
      taperPosV,
      cornerDiameter,
      curveH,
      curveV,
      tailHeight,
      shape,
    ]
  );


  return (
    <group>
      <mesh geometry={geom}>
        <meshStandardMaterial color="gray" side={THREE.DoubleSide} wireframe={wireframe} />
      </mesh>
    </group>
  );
}
