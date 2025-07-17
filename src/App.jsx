import React, { useRef, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useControls, Leva } from 'leva';
import * as THREE from 'three';
import './App.css';
import AirfoilPreview from './components/AirfoilPreview';

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

function createWingGeometry(rootParams, tipParams, sweep, mirrored) {
  const rootPoints = createAirfoilPoints(
    rootParams.chord,
    rootParams.thickness,
    rootParams.camber,
    rootParams.camberPos
  );

  const tipPoints = createAirfoilPoints(
    tipParams.chord,
    tipParams.thickness,
    tipParams.camber,
    tipParams.camberPos
  );

  const rootShape = new THREE.Shape(rootPoints);
  const tipShape = new THREE.Shape(tipPoints);

  const root = rootShape.getPoints(100);
  const tip = tipShape.getPoints(100);

  const vertices = [];

  for (let i = 0; i < root.length; i++) {
    const rp = root[i];
    const tp = tip[i];

    vertices.push(rp.x, rp.y, 0);
    vertices.push(tp.x + sweep, tp.y, 150);
  }

  const mirroredVertices = mirrored ? vertices.map((v, i) => i % 3 === 2 ? -v : v) : [];

  const finalVerts = new Float32Array([...vertices, ...mirroredVertices]);

  const wingGeom = new THREE.BufferGeometry();
  wingGeom.setAttribute('position', new THREE.BufferAttribute(finalVerts, 3));
  return wingGeom;
}

function Wing({ rootParams, tipParams, sweep, mirrored }) {
  const geom = useMemo(() => {
    return createWingGeometry(rootParams, tipParams, sweep, mirrored);
  }, [rootParams, tipParams, sweep, mirrored]);

  return (
    <mesh geometry={geom}>
      <meshStandardMaterial color="skyblue" side={THREE.DoubleSide} />
    </mesh>
  );
}

export default function App() {
  const { sweep, mirrored } = useControls('Wing Settings', {
    sweep: { value: 0, min: -100, max: 100 },
    mirrored: true,
  });

  const rootParams = useControls('Root Airfoil', {
    chord: { value: 100, min: 20, max: 400 },
    thickness: { value: 0.12, min: 0.05, max: 0.25 },
    camber: { value: 0.02, min: 0, max: 0.1 },
    camberPos: { value: 0.4, min: 0.1, max: 0.9 },
  });

  const tipParams = useControls('Tip Airfoil', {
    chord: { value: 60, min: 10, max: 400 },
    thickness: { value: 0.12, min: 0.05, max: 0.25 },
    camber: { value: 0.015, min: 0, max: 0.1 },
    camberPos: { value: 0.4, min: 0.1, max: 0.9 },
  });

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
          label="Root Airfoil"
        />
        <AirfoilPreview
          key={`tip-${JSON.stringify(tipParams)}`}
          chord={tipParams.chord}
          thickness={tipParams.thickness}
          camber={tipParams.camber}
          camberPos={tipParams.camberPos}
          label="Tip Airfoil"
        />
      </div>

      {/* Canvas */}
      <div style={{ flex: 1 }}>
        <Canvas camera={{ position: [0, 0, 400], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[1, 2, 3]} intensity={1} />
          <Wing
            rootParams={rootParams}
            tipParams={tipParams}
            sweep={sweep}
            mirrored={mirrored}
          />
          <OrbitControls />
        </Canvas>
      </div>
    </div>
  );
}
