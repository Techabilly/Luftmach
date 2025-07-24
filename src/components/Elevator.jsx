import React, { useMemo } from 'react';
import * as THREE from 'three';

function createElevatorGeometry({
  rootChord,
  tipChord,
  span,
  sweep,
  leadCurve = 1,
  trailCurve = 1,
  mirrored = true,
  vAngle = 0,
  frontRadius = 0,
  backRadius = 0,
}) {
  const edgeSegments = 20;
  const shape = new THREE.Shape();

  const lead = (t) => sweep * Math.pow(t, leadCurve);
  const trail = (t) =>
    rootChord + (sweep + tipChord - rootChord) * Math.pow(t, trailCurve);

  const backEnd = 1 - backRadius / span;
  const frontEnd = 1 - frontRadius / span;

  shape.moveTo(0, trail(0));
  for (let i = 1; i <= edgeSegments; i++) {
    const t = backEnd * (i / edgeSegments);
    shape.lineTo(span * t, trail(t));
  }

  const backZ = trail(backEnd);
  if (backRadius > 0) {
    shape.lineTo(span - backRadius, backZ);
    shape.quadraticCurveTo(span, backZ, span, backZ - backRadius);
  } else {
    shape.lineTo(span, trail(1));
  }

  const sideEnd = frontRadius > 0 ? lead(frontEnd) + frontRadius : lead(1);
  shape.lineTo(span, sideEnd);

  const frontZ = lead(frontEnd);
  if (frontRadius > 0) {
    shape.quadraticCurveTo(span, frontZ, span - frontRadius, frontZ);
  } else {
    shape.lineTo(span, frontZ);
  }

  for (let i = edgeSegments; i >= 0; i--) {
    const t = frontEnd * (i / edgeSegments);
    shape.lineTo(span * t, lead(t));
  }

  shape.closePath();

  const geom2d = new THREE.ShapeGeometry(shape);

  const pos = geom2d.attributes.position.array;
  const vertCount = pos.length / 3;
  const vertices = [];
  for (let i = 0; i < vertCount; i++) {
    const x = pos[i * 3];
    const z = pos[i * 3 + 1];
    const y = Math.tan((vAngle * Math.PI) / 180) * x;
    vertices.push(x, y, z);
  }

  const indices = Array.from(geom2d.index.array);

  let mirroredVertices = [];
  let mirroredIndices = [];
  if (mirrored) {
    const offset = vertCount;
    mirroredVertices = vertices.map((v, idx) => (idx % 3 === 0 ? -v : v));
    mirroredIndices = indices.map((idx) => idx + offset);
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute(
    'position',
    new THREE.Float32BufferAttribute([...vertices, ...mirroredVertices], 3),
  );
  geom.setIndex([...indices, ...mirroredIndices]);
  geom.computeVertexNormals();
  return geom;
}

export default function Elevator({
  type = 'Flat',
  vAngle = 0,
  rootChord = 20,
  tipChord = 20,
  span = 60,
  sweep = 0,
  leadCurve = 1,
  trailCurve = 1,
  frontRadius = 0,
  backRadius = 0,
  wireframe = false,
  position = [0, 0, 0],
}) {
  const geom = useMemo(
    () =>
      createElevatorGeometry({
        rootChord,
        tipChord,
        span,
        sweep,
        leadCurve,
        trailCurve,
        frontRadius,
        backRadius,
        mirrored: true,
        vAngle: type === 'V' ? vAngle : 0,
      }),
    [
      rootChord,
      tipChord,
      span,
      sweep,
      leadCurve,
      trailCurve,
      frontRadius,
      backRadius,
      vAngle,
      type,
    ],
  );

  return (
    <mesh geometry={geom} position={position} rotation={[0, -Math.PI / 2, 0]}>
      <meshStandardMaterial color="white" side={THREE.DoubleSide} wireframe={wireframe} />
    </mesh>
  );
}
