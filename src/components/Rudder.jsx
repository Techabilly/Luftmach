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

function createRudderGeometry(height, root, tip, sweep) {
  const leadCurve = 1;
  const trailCurve = 1;
  const vertices = [];
  const indices = [];
  let yOffset = 0;

  const xPositions = [0, height];
  const totalSpan = height || 1;
  const rootChord = root.chord;
  const tipChord = tip.chord;
  const lead = (t) => sweep * Math.pow(t, leadCurve);
  const trail = (t) => rootChord + (sweep + tipChord - rootChord) * Math.pow(t, trailCurve);

  const sectionPoints = [root, tip].map((p, idx) => {
    const ratio = xPositions[idx] / totalSpan;
    const chord = p.chord;
    let pts = createAirfoilPoints(chord, p.thickness, p.camber, p.camberPos);
    pts = rotateAirfoil(pts, p.angle || 0, chord, (p.pivotPercent ?? 100) / 100);
    return {
      points: new THREE.Shape(pts).getPoints(100),
      lead: lead(ratio),
      trail: trail(ratio),
      chord,
    };
  });

  const startX = xPositions[0];
  const endX = xPositions[1];
  const spanLen = endX - startX;
  const dihedralRad = ((root.dihedral || 0) * Math.PI) / 180;

  const rootSec = sectionPoints[0];
  const tipSec = sectionPoints[1];
  const count = Math.min(rootSec.points.length, tipSec.points.length);
  const offset = vertices.length / 3;
  for (let i = 0; i < count; i++) {
    const rp = rootSec.points[i];
    const tp = tipSec.points[i];
    if (!rp || !tp) continue;
    const startY = rp.y + yOffset;
    const endY = tp.y + yOffset + Math.tan(dihedralRad) * spanLen;
    const rRatio = rp.x / rootSec.chord;
    const tRatio = tp.x / tipSec.chord;
    const rZ = rootSec.lead + rRatio * (rootSec.trail - rootSec.lead);
    const tZ = tipSec.lead + tRatio * (tipSec.trail - tipSec.lead);
    vertices.push(startX, startY, rZ);
    vertices.push(endX, endY, tZ);
  }
  for (let i = 0; i < count - 1; i++) {
    const r1 = offset + 2 * i;
    const t1 = offset + 2 * i + 1;
    const r2 = offset + 2 * (i + 1);
    const t2 = offset + 2 * (i + 1) + 1;
    indices.push(r1, t1, r2);
    indices.push(t1, t2, r2);
  }
  yOffset += Math.tan(dihedralRad) * spanLen;

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  return geom;
}

export default function Rudder({
  height = 40,
  rootChord = 30,
  tipChord = 20,
  rudderSweep = 0,
  thickness = 0.12,
  camber = 0.02,
  camberPos = 0.4,
  angle = 0,
  offset = 0,
  wireframe = false,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}) {
  const sweep = rudderSweep;
  const geom = useMemo(() => {
    const root = { chord: rootChord, thickness, camber, camberPos, angle, length: height };
    const tip = { chord: tipChord, thickness, camber, camberPos, angle, length: 0 };
    const g = createRudderGeometry(height, root, tip, sweep);
    g.rotateZ(Math.PI / 2);
    g.scale(-1, 1, 1);
    return g;
  }, [height, rootChord, tipChord, sweep, thickness, camber, camberPos, angle]);

  const finalPos = [position[0], position[1], position[2] + offset];

  return (
    <mesh geometry={geom} position={finalPos} rotation={rotation}>
      <meshStandardMaterial color="gray" side={THREE.DoubleSide} wireframe={wireframe} />
    </mesh>
  );
}
