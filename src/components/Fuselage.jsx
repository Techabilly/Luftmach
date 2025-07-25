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

// Generate a series of scaled cross-sections used for nose or tail caps.
// `startPoints`   : Vector2 array describing the section where the cap joins
// `length`        : length of the cap along the fuselage axis
// `segments`      : number of intermediate rings to generate
// `sharpness`     : exponent controlling taper aggressiveness
// `reverse`       : true for tail caps so scaling goes from body to tip
// `taperType`     : 'cone' (linear) or 'round' (sinusoidal)
// Generate concentric sections that approximate a hemispherical/elliptical dome
function createDomeSections(startPoints, length, segments = 5, reverse = false) {
  const results = [];
  for (let i = 1; i <= segments; i++) {
    const t = i / segments; // 0..1
    const scaleF = Math.cos((t * Math.PI) / 2); // 1 -> 0
    const pts = startPoints.map(
      (p) => new THREE.Vector2(p.x * scaleF, p.y * scaleF),
    );
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
  _cornerDiameter,
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
  segmentCount = 20,
) {
  // Sample several positions along the fuselage so taper transitions
  // form smooth curves instead of a single angled segment.
  const segments = segmentCount;
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
    const topScale = scale(p, taperPosV, taperTop, curveV);
    const bottomScale = scale(p, taperPosV, taperBottom, curveV);

    const cross =
      topShape === 'Ellipse' && bottomShape === 'Ellipse'
        ? createEllipseShape(width * hScale, height)
        : createRoundedRectShape(
            width * hScale,
            height,
            topCornerRadius * Math.min(hScale, topScale),
            bottomCornerRadius * Math.min(hScale, bottomScale),
          );

    const pts = cross.getPoints(32).map((pt) =>
      pt.y >= 0
        ? new THREE.Vector2(pt.x, pt.y * topScale)
        : new THREE.Vector2(pt.x, pt.y * bottomScale),
    );
    return pts;
  });

  const sections = [];
  const crossSections = [];
  const frontPos = -length / 2;
  const backPos = length / 2;

  if (closeNose && nosecapLength > 0) {
    const noseSections = createDomeSections(pointArrays[0], nosecapLength, 5, false);
    noseSections.forEach((sec) =>
      sections.push({ points: sec.points, pos: frontPos + sec.offset, y: 0 }),
    );
  }

  positions.forEach((p, idx) => {
    const sec = {
      points: pointArrays[idx],
      pos: frontPos + length * p,
      y: tailHeight * p,
    };
    sections.push(sec);
    crossSections.push(sec);
  });

  if (closeTail && tailcapLength > 0) {
    const tailSections = createDomeSections(
      pointArrays[pointArrays.length - 1],
      tailcapLength,
      5,
      true,
    );
    tailSections.forEach((sec) =>
      sections.push({ points: sec.points, pos: backPos + sec.offset, y: tailHeight }),
    );
  }

  const vertices = [];
  const indices = [];
  let offset = 0;

  for (let s = 0; s < sections.length - 1; s++) {
    const startS = sections[s];
    const endS = sections[s + 1];
    const start = startS.points;
    const end = endS.points;

    for (let i = 0; i < start.length; i++) {
      vertices.push(start[i].x, start[i].y + startS.y, startS.pos);
      vertices.push(end[i].x, end[i].y + endS.y, endS.pos);
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

  // Close nose
  if (closeNose && nosecapLength > 0) {
    const first = sections[0];
    const startIndex = vertices.length / 3;
    for (let i = 0; i < first.points.length; i++) {
      vertices.push(first.points[i].x, first.points[i].y + first.y, first.pos);
    }
    const nosetipIndex = vertices.length / 3;
    vertices.push(0, first.y, frontPos - nosecapLength);
    for (let i = 0; i < first.points.length; i++) {
      const v1 = startIndex + i;
      const v2 = startIndex + ((i + 1) % first.points.length);
      indices.push(v1, v2, nosetipIndex);
    }
  } else {
    const front = pointArrays[0];
    const frontStart = vertices.length / 3;
    for (let i = 0; i < front.length; i++) {
      vertices.push(front[i].x, front[i].y, frontPos);
    }
    const frontCenter = vertices.length / 3;
    vertices.push(0, 0, frontPos);
    for (let i = 0; i < front.length; i++) {
      const v1 = frontStart + i;
      const v2 = frontStart + ((i + 1) % front.length);
      indices.push(v1, v2, frontCenter);
    }
  }

  // Close tail
  if (closeTail && tailcapLength > 0) {
    const last = sections[sections.length - 1];
    const startIndex = vertices.length / 3;
    for (let i = 0; i < last.points.length; i++) {
      vertices.push(last.points[i].x, last.points[i].y + last.y, last.pos);
    }
    const tailtipIndex = vertices.length / 3;
    vertices.push(0, last.y, backPos + tailcapLength);
    for (let i = 0; i < last.points.length; i++) {
      const v1 = startIndex + i;
      const v2 = startIndex + ((i + 1) % last.points.length);
      indices.push(v2, v1, tailtipIndex);
    }
  } else {
    const back = pointArrays[pointArrays.length - 1];
    const backStart = vertices.length / 3;
    for (let i = 0; i < back.length; i++) {
      vertices.push(back[i].x, back[i].y + tailHeight, backPos);
    }
    const backCenter = vertices.length / 3;
    vertices.push(0, tailHeight, backPos);
    for (let i = 0; i < back.length; i++) {
      const v1 = backStart + i;
      const v2 = backStart + ((i + 1) % back.length);
      indices.push(v2, v1, backCenter);
    }
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geom.setIndex(indices);
  BufferGeometryUtils.mergeVertices(geom);
  geom.computeVertexNormals();
  return { geometry: geom, crossSections };
}

export default function Fuselage({
  length,
  width,
  height,
  taperH,
  taperTop,
  taperBottom,
  taperPosH,
  taperPosV,
  cornerDiameter,
  topCornerRadius = cornerDiameter / 2,
  bottomCornerRadius = cornerDiameter / 2,
  curveH = 1,
  curveV = 1,
  tailHeight = 0,
  topShape = 'Square',
  bottomShape = 'Square',
  closeNose = false,
  closeTail = false,
  nosecapLength = 0,
  nosecapSharpness = 1,
  tailcapLength = 0,
  tailcapSharpness = 1,
  segmentCount = 20,
  debugCrossSections = false,
  wireframe = false,
}) {
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
        cornerDiameter,
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
        nosecapSharpness,
        tailcapLength,
        tailcapSharpness,
        segmentCount,
      ),
    [
      length,
      width,
      height,
      taperH,
      taperTop,
      taperBottom,
      taperPosH,
      taperPosV,
      cornerDiameter,
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
      nosecapSharpness,
      tailcapLength,
      tailcapSharpness,
      segmentCount,
    ]
  );

  return (
    <group>
      <mesh geometry={geometry}>
        <meshStandardMaterial color="gray" side={THREE.DoubleSide} wireframe={wireframe} />
      </mesh>
      {debugCrossSections &&
        crossSections.map((sec, idx) => {
          const pts3 = sec.points.map((pt) => new THREE.Vector3(pt.x, pt.y + sec.y, 0));
          const g = new THREE.BufferGeometry().setFromPoints(pts3);
          return (
            <lineLoop key={idx} geometry={g} position={[0, 0, sec.pos]}>
              <lineBasicMaterial color="red" />
            </lineLoop>
          );
        })}
    </group>
  );
}
