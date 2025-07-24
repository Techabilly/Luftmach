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
}) {
  const segments = 20;
  const vertices = [];
  const indices = [];

  const lead = [];
  const trail = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const x = span * t;
    const leadZ = sweep * Math.pow(t, leadCurve);
    const trailZ = rootChord + (sweep + tipChord - rootChord) * Math.pow(t, trailCurve);
    const y = Math.tan((vAngle * Math.PI) / 180) * x;
    lead.push([x, y, leadZ]);
    trail.push([x, y, trailZ]);
  }

  // Create vertices for one side
  lead.forEach((p) => vertices.push(...p));
  trail.forEach((p) => vertices.push(...p));

  for (let i = 0; i < segments; i++) {
    const lf = i;
    const rf = i + 1;
    const lb = i + lead.length;
    const rb = i + 1 + lead.length;
    indices.push(lf, rf, lb);
    indices.push(rf, rb, lb);
  }

  // Mirror
  if (mirrored) {
    const offset = vertices.length / 3;
    vertices.push(...vertices.map((v, idx) => (idx % 3 === 0 ? -v : v)));
    indices.push(...indices.map((idx) => idx + offset));
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geom.setIndex(indices);
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
        mirrored: true,
        vAngle: type === 'V' ? vAngle : 0,
      }),
    [rootChord, tipChord, span, sweep, leadCurve, trailCurve, vAngle, type],
  );

  return (
    <mesh geometry={geom} position={position} rotation={[0, Math.PI / 2, 0]}>
      <meshStandardMaterial color="white" side={THREE.DoubleSide} wireframe={wireframe} />
    </mesh>
  );
}
