import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useControls, Leva } from 'leva';
import * as THREE from 'three';
import './App.css';
import AirfoilPreview from './components/AirfoilPreview';
// Trigger rebuild
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
      return camber / (camberPos ** 2) * (2 * camberPos * xi - xi ** 2);
    } else {
      return camber / ((1 - camberPos) ** 2) * ((1 - 2 * camberPos) + 2 * camberPos * xi - xi ** 2);
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
  // sections: array of airfoil parameter objects describing each spanwise station
  const span = 150;
  const vertices = [];
  const indices = [];
  let yOffset = 0;

  // Precompute rotated point arrays for each section
  const sectionPoints = sections.map((p) => {
    let pts = createAirfoilPoints(
      p.chord,
      p.thickness,
      p.camber,
      p.camberPos
    );
    pts = rotateAirfoil(
      pts,
      p.angle || 0,
      p.chord,
      (p.pivotPercent ?? 100) / 100
    );
    return new THREE.Shape(pts).getPoints(100);
  });

  for (let s = 0; s < sections.length - 1; s++) {
    const startZ = span * s;
    const endZ = span * (s + 1);
    const startSweep = sweep * (s / (sections.length - 1));
    const endSweep = sweep * ((s + 1) / (sections.length - 1));
    const dihedralRad = ((sections[s].dihedral || 0) * Math.PI) / 180;
    const root = sectionPoints[s];
    const tip = sectionPoints[s + 1];

    const offset = vertices.length / 3;
    for (let i = 0; i < root.length; i++) {
      const rp = root[i];
      const tp = tip[i];
      const startY = rp.y + yOffset;
      const endY = tp.y + yOffset + Math.tan(dihedralRad) * span;
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
    yOffset += Math.tan(dihedralRad) * span;
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
      3
    )
  );
  wingGeom.setIndex([...indices, ...mirroredIndices]);
  wingGeom.computeVertexNormals();
  return wingGeom;
}

function Wing({ sections, sweep, mirrored }) {
  const geom = useMemo(() => {
    return createWingGeometry(sections, sweep, mirrored);
  }, [sections, sweep, mirrored]);

  return (
    <mesh geometry={geom}>
      <meshStandardMaterial color="skyblue" side={THREE.DoubleSide} />
    </mesh>
  );
}

export default function App() {
  const { sweep, mirrored, enablePanel1, enablePanel2 } = useControls('Wing Settings', {
    sweep: { value: 0, min: -100, max: 100 },
    mirrored: true,
    enablePanel1: { value: false, label: 'Enable Panel 1' },
    enablePanel2: { value: false, label: 'Enable Panel 2' },
  });

  const rootParams = useControls('Root Airfoil', {
    chord: { value: 100, min: 20, max: 400 },
    thickness: { value: 0.12, min: 0.05, max: 0.25 },
    camber: { value: 0.02, min: 0, max: 0.1 },
    camberPos: { value: 0.4, min: 0.1, max: 0.9 },
    angle: { value: 0, min: -15, max: 15, step: 0.1, label: 'Angle of Attack (°)' },
    dihedral: { value: 0, min: -10, max: 10, step: 0.1, label: 'Dihedral (°)' },
  });


  const panel1Params = useControls('Panel 1 Airfoil', {
    chord: { value: 80, min: 10, max: 400 },
    thickness: { value: 0.12, min: 0.05, max: 0.25 },
    camber: { value: 0.015, min: 0, max: 0.1 },
    camberPos: { value: 0.4, min: 0.1, max: 0.9 },
    angle: { value: 0, min: -15, max: 15, step: 0.1, label: 'Angle of Attack (°)' },
    pivotPercent: {
      value: 100,
      min: 0,
      max: 100,
      step: 1,
      label: 'Rotation Center (%)',
    },
    dihedral: { value: 0, min: -10, max: 10, step: 0.1, label: 'Dihedral (°)' },
  }, { render: () => enablePanel1 });

  const panel2Params = useControls('Panel 2 Airfoil', {
    chord: { value: 70, min: 10, max: 400 },
    thickness: { value: 0.12, min: 0.05, max: 0.25 },
    camber: { value: 0.015, min: 0, max: 0.1 },
    camberPos: { value: 0.4, min: 0.1, max: 0.9 },
    angle: { value: 0, min: -15, max: 15, step: 0.1, label: 'Angle of Attack (°)' },
    pivotPercent: {
      value: 100,
      min: 0,
      max: 100,
      step: 1,
      label: 'Rotation Center (%)',
    },
    dihedral: { value: 0, min: -10, max: 10, step: 0.1, label: 'Dihedral (°)' },
  }, { render: () => enablePanel2 });

  const tipParams = useControls('Tip Airfoil', {
    chord: { value: 60, min: 10, max: 400 },
    thickness: { value: 0.12, min: 0.05, max: 0.25 },
    camber: { value: 0.015, min: 0, max: 0.1 },
    camberPos: { value: 0.4, min: 0.1, max: 0.9 },
    angle: { value: 0, min: -15, max: 15, step: 0.1, label: 'Angle of Attack (°' },
    pivotPercent: {
      value: 100,
      min: 0,
      max: 100,
      step: 1,
      label: 'Rotation Center (%)',
    },
  });

  const sections = [rootParams];
  if (enablePanel1) sections.push(panel1Params);
  if (enablePanel2) sections.push(panel2Params);
  sections.push(tipParams);

  return (
    <div id="app" style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar: Controls + Previews */}
      <div style={{
        width: '340px',
        backgroundColor: '#181818',
        padding: '10px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        borderRight: '1px solid #333',
        overflowY: 'auto'
      }}>
        <Leva
          collapsed={false}
          fill
          theme={{ colors: { elevation1: '#222' } }}
        />
        <AirfoilPreview
          key={`root-${JSON.stringify(rootParams)}`}
          chord={rootParams.chord}
          thickness={rootParams.thickness}
          camber={rootParams.camber}
          camberPos={rootParams.camberPos}
          angle={rootParams.angle}
          label="Root Airfoil"
        />
        {enablePanel1 && (
          <AirfoilPreview
            key={`panel1-${JSON.stringify(panel1Params)}`}
            chord={panel1Params.chord}
            thickness={panel1Params.thickness}
            camber={panel1Params.camber}
            camberPos={panel1Params.camberPos}
            angle={panel1Params.angle}
            pivotPercent={panel1Params.pivotPercent}
            label="Panel 1 Airfoil"
          />
        )}
        {enablePanel2 && (
          <AirfoilPreview
            key={`panel2-${JSON.stringify(panel2Params)}`}
            chord={panel2Params.chord}
            thickness={panel2Params.thickness}
            camber={panel2Params.camber}
            camberPos={panel2Params.camberPos}
            angle={panel2Params.angle}
            pivotPercent={panel2Params.pivotPercent}
            label="Panel 2 Airfoil"
          />
        )}
        <AirfoilPreview
          key={`tip-${JSON.stringify(tipParams)}`}
          chord={tipParams.chord}
          thickness={tipParams.thickness}
          camber={tipParams.camber}
          camberPos={tipParams.camberPos}
          angle={tipParams.angle}
          pivotPercent={tipParams.pivotPercent}
          label="Tip Airfoil"
        />
      </div>

      {/* Canvas */}
      <div style={{ flex: 1 }}>
        <Canvas camera={{ position: [0, 0, 400], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[1, 2, 3]} intensity={1} />
          <Wing
            sections={sections}
            sweep={sweep}
            mirrored={mirrored}
          />
          <OrbitControls />
        </Canvas>
      </div>
    </div>
  );
}
