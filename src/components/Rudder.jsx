import React, { useMemo } from 'react';
import * as THREE from 'three';

export default function Rudder({
  height = 40,
  rootChord = 30,
  tipChord = 0,
  thickness = 2,
  frontCurve = 1,
  backCurve = 1,
  frontRadius = 0,
  backRadius = 0,
  offset = 0,
  wireframe = false,
  position = [0, 0, 0],
}) {
  const geom = useMemo(() => {
    const shape = new THREE.Shape();
    const edgeSegments = 20;
    const cornerSegments = 10;

    const backX = (t) => rootChord + (tipChord - rootChord) * t;
    const frontX = (t) => -(rootChord - tipChord) * t;

    const backEdgeEnd = 1 - backRadius / height;
    const frontEdgeEnd = 1 - frontRadius / height;

    function addCorner(cx, cy, radius, startA, endA, curve) {
      for (let i = 1; i <= cornerSegments; i++) {
        const t = i / cornerSegments;
        const eased =
          t < 0.5
            ? 0.5 * Math.pow(2 * t, curve)
            : 1 - 0.5 * Math.pow(2 * (1 - t), curve);
        const angle = startA + (endA - startA) * eased;
        shape.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
      }
    }

    shape.moveTo(frontX(0), 0);
    shape.lineTo(backX(0), 0);

    for (let i = 1; i <= edgeSegments; i++) {
      const t = backEdgeEnd * (i / edgeSegments);
      shape.lineTo(backX(t), height * t);
    }

    shape.lineTo(backX(1), height - backRadius);
    if (backRadius > 0) {
      addCorner(
        backX(1) - backRadius,
        height - backRadius,
        backRadius,
        0,
        Math.PI / 2,
        backCurve,
      );
    } else {
      shape.lineTo(backX(1), height);
    }

    shape.lineTo(frontX(1) + frontRadius, height);

    if (frontRadius > 0) {
      addCorner(
        frontX(1) + frontRadius,
        height - frontRadius,
        frontRadius,
        Math.PI / 2,
        Math.PI,
        frontCurve,
      );
    } else {
      shape.lineTo(frontX(1), height);
    }

    for (let i = edgeSegments; i >= 0; i--) {
      const t = frontEdgeEnd * (i / edgeSegments);
      shape.lineTo(frontX(t), height * t);
    }

    shape.closePath();

    const g = new THREE.ExtrudeGeometry(shape, { depth: thickness, bevelEnabled: false });
    g.rotateY(Math.PI / 2);
    return g;
  }, [
    height,
    rootChord,
    tipChord,
    thickness,
    frontCurve,
    backCurve,
    frontRadius,
    backRadius,
  ]);

  const finalPos = [position[0], position[1], position[2] + offset];

  return (
    <mesh geometry={geom} position={finalPos}>
      <meshStandardMaterial color="gray" side={THREE.DoubleSide} wireframe={wireframe} />
    </mesh>
  );
}
