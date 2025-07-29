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

function createEllipseShape(width, height) {
  const shape = new THREE.Shape();
  shape.absellipse(0, 0, width / 2, height / 2, 0, Math.PI * 2, false, 0);
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
  width,
  height,
  taperH,
  taperTop,
  taperBottom,
  taperPosH,
  taperPosV,
  topCornerRadius,
  bottomCornerRadius,
  curveH,
  curveV,
  tailHeight = 0,
  topShape = 'Square',
  bottomShape = 'Square',
  closeNose = false,
  closeTail = false,
  nosecapLength = 0,
  tailcapLength = 0,
  segmentCount = 20
) {
  const segments = segmentCount;
  const positions = Array.from({ length: segments + 1 }, (_, i) => i / segments);

  function scale(p, pos, taper, curve) {
    if (pos >= 1) return p < 1 ? 1 : taper;
    if (p <= pos) return 1;
    const t = (p - pos) / (1 - pos);
    const curved = Math.pow(t, curve);
    const s = 1 + curved * (taper - 1);
    return Math.max(s, 0.001);
  }

  function verticalBlend(y, height, topScale, bottomScale) {
    const t = (y + height / 2) / height; // 0 at bottom, 1 at top
    return bottomScale * (1 - t) + topScale * t;
  }

  const pointArrays = positions.map(p => {
    const hScale = scale(p, taperPosH, taperH, curveH);
    const topScale = scale(p, taperPosV, taperTop, curveV);
    const bottomScale = scale(p, taperPosV, taperBottom, curveV);

    const shape = (topShape === 'Ellipse' && bottomShape === 'Ellipse')
      ? createEllipseShape(width * hScale, height)
      : createRoundedRectShape(
          width * hScale,
          height,
          topCornerRadius * Math.min(hScale, topScale),
          bottomCornerRadius * Math.min(hScale, bottomScale)
        );

    return shape.getPoints(32).map(pt => {
      const blend = verticalBlend(pt.y, height, topScale, bottomScale);
      return new THREE.Vector2(pt.x, pt.y * blend);
    });
  });

  const sections = [];
  const crossSections = [];
  const frontPos = -length / 2;
  const backPos = length / 2;

  if (closeNose && nosecapLength > 0) {
    const noseSections = createDomeSections(pointArrays[0], nosecapLength, 5, false);
    noseSections.forEach(sec =>
      sections.push({ points: sec.points, pos: frontPos + sec.offset, y: 0 })
    );
  }

  positions.forEach((p, idx) => {
    const sec = {
      points: pointArrays[idx],
      pos: frontPos + length * p,
      y: tailHeight * p
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
      sections.push({ points: sec.points, pos: backPos + sec.offset, y: tailHeight })
    );
  }

  const vertices = [];
  const indices = [];
  let offset = 0;

  for (let s = 0; s < sections.length - 1; s++) {
    const start = sections[s];
    const end = sections[s + 1];

    for (let i = 0; i < start.points.length; i++) {
      vertices.push(start.points[i].x, start.points[i].y + start.y, start.pos);
      vertices.push(end.points[i].x, end.points[i].y + end.y, end.pos);
    }

    for (let i = 0; i < start.points.length - 1; i++) {
      const r1 = offset + 2 * i;
      const t1 = offset + 2 * i + 1;
      const r2 = offset + 2 * (i + 1);
      const t2 = offset + 2 * (i + 1) + 1;
      indices.push(r1, t1, r2);
      indices.push(t1, t2, r2);
    }

    const last = start.points.length - 1;
    indices.push(offset + 2 * last, offset + 2 * last + 1, offset);
    indices.push(offset + 2 * last + 1, offset + 1, offset);
    offset += start.points.length * 2;
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
    width,
    height,
    taperH,
    taperTop,
    taperBottom,
    taperPosH,
    taperPosV,
    topCornerRadius = 0,
    bottomCornerRadius = 0,
    curveH = 1,
    curveV = 1,
    tailHeight = 0,
    topShape = 'Square',
    bottomShape = 'Square',
    closeNose = false,
    closeTail = false,
    nosecapLength = 0,
    tailcapLength = 0,
    segmentCount = 20,
    debugCrossSections = false,
    wireframe = false,
  } = props;

  const { geometry, crossSections } = useMemo(
    () =>
      createFuselageGeometry(
        length,
        width,
        height,
        taperH,
        taperTop,
        taperBottom,
        taperPosH,
        taperPosV,
        topCornerRadius,
        bottomCornerRadius,
        curveH,
        curveV,
        tailHeight,
        topShape,
        bottomShape,
        closeNose,
        closeTail,
        nosecapLength,
        tailcapLength,
        segmentCount
      ),
    [
      length, width, height,
      taperH, taperTop, taperBottom,
      taperPosH, taperPosV,
      topCornerRadius, bottomCornerRadius,
      curveH, curveV,
      tailHeight, topShape, bottomShape,
      closeNose, closeTail,
      nosecapLength, tailcapLength,
      segmentCount
    ]
  );

  return (
    <group>
      <mesh geometry={geometry}>
        <meshStandardMaterial color="gray" side={THREE.DoubleSide} wireframe={wireframe} />
      </mesh>
      {debugCrossSections && crossSections.map((sec, idx) => {
        const g = new THREE.BufferGeometry().setFromPoints(
          sec.points.map(p => new THREE.Vector3(p.x, p.y + sec.y, 0))
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
