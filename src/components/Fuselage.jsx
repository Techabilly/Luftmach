import React, { useMemo } from 'react';
import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';

// Basic rectangular profile with independently rounded top and bottom edges
function createRoundedRectShape(width, height, topRadius = 0, bottomRadius = 0) {
  const halfW = width / 2;
  const halfH = height / 2;
  const tr = Math.min(topRadius, halfW, halfH);
  const br = Math.min(bottomRadius, halfW, halfH);
  const shape = new THREE.Shape();

  shape.moveTo(-halfW + br, -halfH);
  shape.lineTo(halfW - br, -halfH);
  if (br) shape.quadraticCurveTo(halfW, -halfH, halfW, -halfH + br);
  else shape.lineTo(halfW, -halfH);
  shape.lineTo(halfW, halfH - tr);
  if (tr) shape.quadraticCurveTo(halfW, halfH, halfW - tr, halfH);
  else shape.lineTo(halfW, halfH);
  shape.lineTo(-halfW + tr, halfH);
  if (tr) shape.quadraticCurveTo(-halfW, halfH, -halfW, halfH - tr);
  else shape.lineTo(-halfW, halfH);
  shape.lineTo(-halfW, -halfH + br);
  if (br) shape.quadraticCurveTo(-halfW, -halfH, -halfW + br, -halfH);
  else shape.lineTo(-halfW, -halfH);

  return shape;
}

// Dome-style nose/tail cap generator
function createDomeSections(startPoints, length, segments = 5, reverse = false) {
  const results = [];
  for (let i = 1; i <= segments; i++) {
    const t = i / segments;
    const scaleF = Math.cos((t * Math.PI) / 2);
    const pts = startPoints.map(p => new THREE.Vector2(p.x * scaleF, p.y * scaleF));
    const offset = reverse ? length * t : -length * t;
    results.push({ points: pts, offset });
  }
  return results;
}

function createFuselageGeometry(
  length,
  frontWidth,
  frontHeight,
  backWidth,
  backHeight,
  cornerRadius,
  curveH,
  curveV,
  tailHeight = 0,
  verticalAlign = 0.5,
  closeNose = false,
  closeTail = false,
  nosecapLength = 0,
  tailcapLength = 0,
  segmentCount = 20
) {
  const segments = segmentCount;
  const positions = Array.from({ length: segments + 1 }, (_, i) => i / segments);
  const alignFactor = 0.5 - verticalAlign;

  const pointArrays = [];
  const yOffsets = [];

  positions.forEach(p => {
    const w = frontWidth + (backWidth - frontWidth) * Math.pow(p, curveH);
    const h = frontHeight + (backHeight - frontHeight) * Math.pow(p, curveV);
    const r = Math.min(cornerRadius, w / 2, h / 2);
    const shape = createRoundedRectShape(w, h, r, r);
    // Use evenly spaced points to ensure each cross section
    // has the same number of vertices regardless of corner
    // radius or degenerate dimensions (e.g. very narrow tail).
    // This prevents crashes when sections at the tail have
    // fewer path segments than those at the nose.
    pointArrays.push(shape.getSpacedPoints(64));
    const yOff = alignFactor * (frontHeight - h) + tailHeight * p;
    yOffsets.push(yOff);
  });

  const sections = [];
  const crossSections = [];
  const frontPos = -length / 2;
  const backPos = length / 2;

  if (closeNose && nosecapLength > 0) {
    const noseSections = createDomeSections(pointArrays[0], nosecapLength, 5, false);
    noseSections.forEach(sec =>
      sections.push({ points: sec.points, pos: frontPos + sec.offset, y: yOffsets[0] })
    );
  }

  positions.forEach((p, idx) => {
    const sec = {
      points: pointArrays[idx],
      pos: frontPos + length * p,
      y: yOffsets[idx]
    };
    sections.push(sec);
    crossSections.push(sec);
  });

  if (closeTail && tailcapLength > 0) {
    const tailSections = createDomeSections(
      pointArrays[pointArrays.length - 1],
      tailcapLength,
      5,
      true
    );
    tailSections.forEach(sec =>
      sections.push({ points: sec.points, pos: backPos + sec.offset, y: yOffsets[yOffsets.length - 1] })
    );
  }

  const vertices = [];
  const indices = [];
  let offset = 0;

  for (let s = 0; s < sections.length - 1; s++) {
    const start = sections[s];
    const end = sections[s + 1];

    // Some sections can end up with differing point counts which would
    // cause null/undefined accesses when building the geometry. Guard
    // against this by only iterating over the shared subset of points.
    const count = Math.min(start.points.length, end.points.length);

    for (let i = 0; i < count; i++) {
      const sp = start.points[i];
      const ep = end.points[i];
      if (!sp || !ep) continue;
      vertices.push(sp.x, sp.y + start.y, start.pos);
      vertices.push(ep.x, ep.y + end.y, end.pos);
    }

    for (let i = 0; i < count - 1; i++) {
      const r1 = offset + 2 * i;
      const t1 = offset + 2 * i + 1;
      const r2 = offset + 2 * (i + 1);
      const t2 = offset + 2 * (i + 1) + 1;
      indices.push(r1, t1, r2);
      indices.push(t1, t2, r2);
    }

    const last = count - 1;
    if (last >= 0) {
      indices.push(offset + 2 * last, offset + 2 * last + 1, offset);
      indices.push(offset + 2 * last + 1, offset + 1, offset);
    }
    offset += count * 2;
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geom.setIndex(indices);
  BufferGeometryUtils.mergeVertices(geom);
  geom.computeVertexNormals();

  return { geometry: geom, crossSections };
}


export default function Fuselage(props) {
  const {
    length,
    frontWidth,
    frontHeight,
    backWidth,
    backHeight,
    cornerRadius = 0,
    curveH = 1,
    curveV = 1,
    verticalAlign = 0.5,
    tailHeight = 0,
    closeNose = false,
    closeTail = false,
    nosecapLength = 0,
    tailcapLength = 0,
    segmentCount = 20,
    debugCrossSections = false,
    wireframe = false,
    color = 'gray',
  } = props;

  const { geometry, crossSections } = useMemo(
    () =>
      createFuselageGeometry(
        length,
        frontWidth,
        frontHeight,
        backWidth,
        backHeight,
        cornerRadius,
        curveH,
        curveV,
        tailHeight,
        verticalAlign,
        closeNose,
        closeTail,
        nosecapLength,
        tailcapLength,
        segmentCount
      ),
    [
      length,
      frontWidth,
      frontHeight,
      backWidth,
      backHeight,
      cornerRadius,
      curveH,
      curveV,
      tailHeight,
      verticalAlign,
      closeNose,
      closeTail,
      nosecapLength,
      tailcapLength,
      segmentCount
    ]
  );

  return (
    <group>
      <mesh geometry={geometry}>
        <meshStandardMaterial color={color} side={THREE.DoubleSide} wireframe={wireframe} />
      </mesh>
      {debugCrossSections && crossSections.map((sec, idx) => {
        const g = new THREE.BufferGeometry().setFromPoints(
          sec.points
            .filter(Boolean)
            .map((p) => new THREE.Vector3(p.x, p.y + sec.y, 0))
        );
        return (
          <lineLoop key={idx} geometry={g} position={[0, 0, sec.pos]}>
            <lineBasicMaterial color="red" />
          </lineLoop>
        );
      })}
    </group>
  );
}
