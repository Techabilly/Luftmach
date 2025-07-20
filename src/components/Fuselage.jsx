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
  curveH,
  curveV,
  tailHeight = 0,
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
    return 1 + curved * (taper - 1);
  }

  const pointArrays = positions.map((p) => {
    const hScale = scale(p, taperPosH, taperH, curveH);
    const vScale = scale(p, taperPosV, taperV, curveV);
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
    const startYOffset = tailHeight * positions[s];
    const endYOffset = tailHeight * positions[s + 1];
    const start = pointArrays[s];
    const end = pointArrays[s + 1];

    for (let i = 0; i < start.length; i++) {
      vertices.push(startX, start[i].y + startYOffset, start[i].x);
      vertices.push(endX, end[i].y + endYOffset, end[i].x);
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
  curveH = 1,
  curveV = 1,
  tailHeight = 0,
  noseLength = 0,
  wireframe = false,
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
        curveH,
        curveV,
        tailHeight,
      ),
    [length, width, taperH, taperV, taperPosH, taperPosV, cornerDiameter, curveH, curveV, tailHeight]
  );

  const noseGeom = useMemo(() => {
    if (noseLength <= 0) return null;
    return createFuselageGeometry(
      noseLength,
      width * taperH,
      1 / taperH,
      1 / taperV,
      taperPosH,
      taperPosV,
      cornerDiameter * Math.min(taperH, taperV),
      curveH,
      curveV,
    );
  }, [noseLength, width, taperH, taperV, taperPosH, taperPosV, cornerDiameter, curveH, curveV]);

  const nosePos = useMemo(() => [-length / 2 - noseLength / 2, 0, 0], [length, noseLength]);

  return (
    <group>
      <mesh geometry={geom}>
        <meshStandardMaterial color="gray" side={THREE.DoubleSide} wireframe={wireframe} />
      </mesh>
      {noseGeom && (
        <mesh geometry={noseGeom} position={nosePos}>
          <meshStandardMaterial color="gray" side={THREE.DoubleSide} wireframe={wireframe} />
        </mesh>
      )}
    </group>
  );
}
