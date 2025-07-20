import React, { useMemo } from 'react';
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
      return (camber / (camberPos ** 2)) * (2 * camberPos * xi - xi ** 2);
    } else {
      return (camber / ((1 - camberPos) ** 2)) * ((1 - 2 * camberPos) + 2 * camberPos * xi - xi ** 2);
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

  const top = xu.map((x, i) => new THREE.Vector2(x * chord, yu[i] * chord));
  const bottom = xl.slice().reverse().map((x, i) => new THREE.Vector2(x * chord, yl.slice().reverse()[i] * chord));

  return [...top, ...bottom];
}

function rotateAirfoil(points, angle, chord, pivotRatio = 1) {
  const radians = (angle * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  const pivotX = chord * pivotRatio;
  const pivotY = 0;

  return points.map((p) => {
    const dx = p.x - pivotX;
    const dy = p.y - pivotY;
    const xr = dx * cos - dy * sin + pivotX;
    const yr = dx * sin + dy * cos + pivotY;
    return new THREE.Vector2(xr, yr);
  });
}

function createWingGeometry(sections, sweep, mirrored) {
  const vertices = [];
  const indices = [];
  let yOffset = 0;

  const sectionPoints = sections.map((p) => {
    let pts = createAirfoilPoints(
      p.chord,
      p.thickness,
      p.camber,
      p.camberPos,
    );
    pts = rotateAirfoil(
      pts,
      p.angle || 0,
      p.chord,
      (p.pivotPercent ?? 100) / 100,
    );
    return new THREE.Shape(pts).getPoints(100);
  });

  const zPositions = [0];
  for (let i = 0; i < sections.length - 1; i++) {
    const len = sections[i].length || 0;
    zPositions.push(zPositions[i] + len);
  }

  const totalSpan = zPositions[zPositions.length - 1] || 1;

  for (let s = 0; s < sections.length - 1; s++) {
    const startZ = zPositions[s];
    const endZ = zPositions[s + 1];
    const spanLen = endZ - startZ;
    const startSweep = sweep * (startZ / totalSpan);
    const endSweep = sweep * (endZ / totalSpan);
    const dihedralRad = ((sections[s].dihedral || 0) * Math.PI) / 180;
    const root = sectionPoints[s];
    const tip = sectionPoints[s + 1];

    const offset = vertices.length / 3;
    for (let i = 0; i < root.length; i++) {
      const rp = root[i];
      const tp = tip[i];
      const startY = rp.y + yOffset;
      const endY = tp.y + yOffset + Math.tan(dihedralRad) * spanLen;
      vertices.push(rp.x + startSweep, startY, startZ);
      vertices.push(tp.x + endSweep, endY, endZ);
    }
    for (let i = 0; i < root.length - 1; i++) {
      const r1 = offset + 2 * i;
      const t1 = offset + 2 * i + 1;
      const r2 = offset + 2 * (i + 1);
      const t2 = offset + 2 * (i + 1) + 1;
      indices.push(r1, t1, r2);
      indices.push(t1, t2, r2);
    }
    yOffset += Math.tan(dihedralRad) * spanLen;
  }

  let mirroredVertices = [];
  let mirroredIndices = [];
  if (mirrored) {
    const offset = vertices.length / 3;
    mirroredVertices = vertices.map((v, i) => (i % 3 === 2 ? -v : v));
    mirroredIndices = indices.map((idx) => idx + offset);
  }

  const wingGeom = new THREE.BufferGeometry();
  wingGeom.setAttribute(
    'position',
    new THREE.BufferAttribute(
      new Float32Array([...vertices, ...mirroredVertices]),
      3,
    ),
  );
  wingGeom.setIndex([...indices, ...mirroredIndices]);
  wingGeom.computeVertexNormals();
  return wingGeom;
}

export default function Wing({ sections, sweep, mirrored, mountHeight = 0, mountX = 0, wireframe = false }) {
  const geom = useMemo(() => {
    return createWingGeometry(sections, sweep, mirrored);
  }, [sections, sweep, mirrored]);

  return (
    <group position={[mountX, mountHeight, 0]}>
      <mesh geometry={geom}>
        <meshStandardMaterial color="skyblue" side={THREE.DoubleSide} wireframe={wireframe} />
      </mesh>
    </group>
  );
}
