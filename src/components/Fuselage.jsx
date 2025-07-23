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

function createTopBottomShape(width, height, radius, topShape, bottomShape) {
  const halfW = width / 2;
  const halfH = height / 2;
  const r = Math.min(radius, halfW, halfH);
  const shape = new THREE.Shape();
  shape.moveTo(halfW, 0);

  if (bottomShape === 'Ellipse') {
    shape.absellipse(0, 0, halfW, halfH, 0, Math.PI, true, 0);
  } else {
    shape.lineTo(halfW, -halfH + r);
    shape.quadraticCurveTo(halfW, -halfH, halfW - r, -halfH);
    shape.lineTo(-halfW + r, -halfH);
    shape.quadraticCurveTo(-halfW, -halfH, -halfW, -halfH + r);
    shape.lineTo(-halfW, 0);
  }

  if (topShape === 'Ellipse') {
    shape.absellipse(0, 0, halfW, halfH, Math.PI, Math.PI * 2, true, 0);
  } else {
    shape.lineTo(-halfW, halfH - r);
    shape.quadraticCurveTo(-halfW, halfH, -halfW + r, halfH);
    shape.lineTo(halfW - r, halfH);
    shape.quadraticCurveTo(halfW, halfH, halfW, halfH - r);
    shape.lineTo(halfW, 0);
  }

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
  taperTop,
  taperBottom,
  taperPosH,
  taperPosV,
  cornerDiameter,
  curveH,
  curveV,
  tailHeight = 0,
  topShape = 'Square',
  bottomShape = 'Square',
  closeNose = false,
  closeTail = false,
  nosecapLength = 0,
  nosecapSharpness = 1,
  tailcapLength = 0,
  tailcapSharpness = 1,
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
    const topScale = scale(p, taperPosV, taperTop, curveV);
    const bottomScale = scale(p, taperPosV, taperBottom, curveV);
    const avgScale = (topScale + bottomScale) / 2;
    let cross;
    if (topShape === 'Ellipse' && bottomShape === 'Ellipse') {
      cross = createEllipseShape(width * hScale, height);
    } else if (topShape === 'Square' && bottomShape === 'Square') {
      cross = createRoundedRectShape(
        width * hScale,
        height,
        radius * Math.min(hScale, avgScale),
      );
    } else {
      cross = createTopBottomShape(
        width * hScale,
        height,
        radius * Math.min(hScale, avgScale),
        topShape,
        bottomShape,
      );
    }
    const pts = cross.getPoints(32).map((pt) =>
      pt.y >= 0
        ? new THREE.Vector2(pt.x, pt.y * topScale)
        : new THREE.Vector2(pt.x, pt.y * bottomScale),
    );
    return pts;
  });

  const sections = [];
  const frontPos = -length / 2;
  const backPos = length / 2;

  if (closeNose && nosecapLength > 0) {
    const capSeg = 5;
    for (let i = 1; i <= capSeg; i++) {
      const r = i / (capSeg + 1);
      const scaleF = Math.pow(r, nosecapSharpness);
      const pts = pointArrays[0].map((p) => new THREE.Vector2(p.x * scaleF, p.y * scaleF));
      sections.push({ points: pts, pos: frontPos - nosecapLength + nosecapLength * r, y: 0 });
    }
  }

  positions.forEach((p, idx) => {
    sections.push({
      points: pointArrays[idx],
      pos: frontPos + length * p,
      y: tailHeight * p,
    });
  });

  if (closeTail && tailcapLength > 0) {
    const capSeg = 5;
    for (let i = 1; i <= capSeg; i++) {
      const r = i / (capSeg + 1);
      const scaleF = Math.pow(1 - r, tailcapSharpness);
      const pts = pointArrays[pointArrays.length - 1].map((p) => new THREE.Vector2(p.x * scaleF, p.y * scaleF));
      sections.push({ points: pts, pos: backPos + tailcapLength * r, y: tailHeight });
    }
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
    const tipIndex = vertices.length / 3;
    vertices.push(0, first.y, frontPos - nosecapLength);
    for (let i = 0; i < first.points.length; i++) {
      const v1 = startIndex + i;
      const v2 = startIndex + ((i + 1) % first.points.length);
      indices.push(v1, v2, tipIndex);
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
    const tipIndex = vertices.length / 3;
    vertices.push(0, last.y, backPos + nosecapLength);
    for (let i = 0; i < last.points.length; i++) {
      const v1 = startIndex + i;
      const v2 = startIndex + ((i + 1) % last.points.length);
      indices.push(v2, v1, tipIndex);
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
  geom.computeVertexNormals();
  return geom;
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
  wireframe = false,
}) {
  const geom = useMemo(
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
