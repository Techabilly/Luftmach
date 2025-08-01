import React, { useRef, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useControls, Leva } from 'leva';
import { resetNumber } from './components/ResetNumberPlugin';

function num(value, settings = {}) {
  return { value, component: resetNumber, ...settings };
}
import * as THREE from 'three';
import './App.css';
import AirfoilPreview from './components/AirfoilPreview';
import ViewControls from './components/ViewControls';
import Aircraft from './components/Aircraft';
import MiniView from './components/MiniView';
//
function ResizeHandler() {
  const { camera, size } = useThree();
  useEffect(() => {
    camera.aspect = size.width / size.height;
    camera.updateProjectionMatrix();
  }, [camera, size]);
  return null;
}

function CameraCenter({ controlsRef, targetGroup }) {
  const { camera } = useThree();
  useEffect(() => {
    if (!controlsRef.current || !targetGroup.current) return;
    const box = new THREE.Box3().setFromObject(targetGroup.current);
    const center = new THREE.Vector3();
    box.getCenter(center);
    const offset = new THREE.Vector3().subVectors(camera.position, controlsRef.current.target);
    controlsRef.current.target.copy(center);
    camera.position.copy(center.clone().add(offset));
    controlsRef.current.update();
  }, [camera, controlsRef, targetGroup]);
  return null;
}
// Trigger rebuild
export default function App({ showAirfoilControls = false } = {}) {
  const controlsRef = useRef();
  const groupRef = useRef();
  const {
    sweep,
    mirrored,
    enablePanel1,
    enablePanel2,
    mountHeight,
    mountZ,
  } = useControls('Wing Settings', {
    sweep: num(0, { min: -300, max: 300 }),
    mirrored: true,
    mountHeight: num(0, { min: -30, max: 30, step: 1, label: 'Mount Height' }),
    mountZ: num(-87, { min: -300, max: 300, step: 1, label: 'Mount Position' }),
    enablePanel1: { value: false, label: 'Enable Panel 1' },
    enablePanel2: { value: false, label: 'Enable Panel 2' },
  });

  const rootParams = useControls('Wing Root', {
    chord: num(100, { min: 20, max: 400, render: () => !showAirfoilControls }),
    thickness: num(0.12, { min: 0.05, max: 0.25, render: () => showAirfoilControls }),
    camber: num(0.02, { min: 0, max: 0.1, render: () => showAirfoilControls }),
    camberPos: num(0.4, { min: 0.1, max: 0.9, render: () => showAirfoilControls }),
    length: num(150, { min: 10, max: 500, label: 'Panel Length' }),
    angle: num(0, { min: -15, max: 15, step: 0.1, label: 'Angle of Attack (°)' }),
    dihedral: num(0, { min: -20, max: 20, step: 0.1, label: 'Dihedral (°)' }),
  });


  const panel1Params = useControls('Panel 1 Airfoil', {
    chord: num(80, { min: 10, max: 400, render: () => !showAirfoilControls }),
    thickness: num(0.12, { min: 0.05, max: 0.25, render: () => showAirfoilControls }),
    camber: num(0.015, { min: 0, max: 0.1, render: () => showAirfoilControls }),
    camberPos: num(0.4, { min: 0.1, max: 0.9, render: () => showAirfoilControls }),
    length: num(150, { min: 10, max: 500, label: 'Panel Length' }),
    angle: num(0, { min: -15, max: 15, step: 0.1, label: 'Angle of Attack (°)' }),
    pivotPercent: num(100, { min: 0, max: 100, step: 1, label: 'Rotation Center (%)' }),
    dihedral: num(0, { min: -20, max: 20, step: 0.1, label: 'Dihedral (°)' }),
  }, { render: (get) => get('Wing Settings.enablePanel1') });

  const panel2Params = useControls('Panel 2 Airfoil', {
    chord: num(70, { min: 10, max: 400, render: () => !showAirfoilControls }),
    thickness: num(0.12, { min: 0.05, max: 0.25, render: () => showAirfoilControls }),
    camber: num(0.015, { min: 0, max: 0.1, render: () => showAirfoilControls }),
    camberPos: num(0.4, { min: 0.1, max: 0.9, render: () => showAirfoilControls }),
    length: num(150, { min: 10, max: 500, label: 'Panel Length' }),
    angle: num(0, { min: -15, max: 15, step: 0.1, label: 'Angle of Attack (°)' }),
    pivotPercent: num(100, { min: 0, max: 100, step: 1, label: 'Rotation Center (%)' }),
    dihedral: num(0, { min: -20, max: 20, step: 0.1, label: 'Dihedral (°)' }),
  }, { render: (get) => get('Wing Settings.enablePanel2') });

  const tipParams = useControls('Wing Tip', {
    chord: num(60, { min: 10, max: 400, render: () => !showAirfoilControls }),
    thickness: num(0.12, { min: 0.05, max: 0.25, render: () => showAirfoilControls }),
    camber: num(0.015, { min: 0, max: 0.1, render: () => showAirfoilControls }),
    camberPos: num(0.4, { min: 0.1, max: 0.9, render: () => showAirfoilControls }),
    angle: num(0, { min: -15, max: 15, step: 0.1, label: 'Angle of Attack (°)' }),
    pivotPercent: num(100, { min: 0, max: 100, step: 1, label: 'Rotation Center (%)' }),
  });


  const fuselageParams = useControls('Fuselage', {
    showFuselage: { value: true, label: 'Show Fuselage' },
    topShape: { value: 'Square', options: ['Square', 'Ellipse'], label: 'Top Shape' },
    bottomShape: { value: 'Square', options: ['Square', 'Ellipse'], label: 'Bottom Shape' },
    length: num(200, { min: 50, max: 600 }),
    width: num(40, { min: 10, max: 200 }),
    height: num(40, { min: 10, max: 200 }),
    taperH: num(0.8, { min: 0.1, max: 1, step: 0.01, label: 'Horizontal Taper' }),
    taperTop: num(0.8, { min: 0.1, max: 1, step: 0.01, label: 'Top Taper' }),
    taperBottom: num(0.8, { min: 0.1, max: 1, step: 0.01, label: 'Bottom Taper' }),
    taperPosH: num(0, { min: 0, max: 1, step: 0.01, label: 'Horizontal Taper Start' }),
    taperPosV: num(0, { min: 0, max: 1, step: 0.01, label: 'Vertical Taper Start' }),
    topCornerRadius: {
      ...num(10, { min: 0, max: 50, label: 'Top Corner Radius' }),
      render: (get) =>
        get('Fuselage.topShape') === 'Square' ||
        get('Fuselage.bottomShape') === 'Square',
    },
    bottomCornerRadius: {
      ...num(10, { min: 0, max: 50, label: 'Bottom Corner Radius' }),
      render: (get) =>
        get('Fuselage.topShape') === 'Square' ||
        get('Fuselage.bottomShape') === 'Square',
    },
    curveH: num(1, { min: 0.1, max: 5, step: 0.1, label: 'Horizontal Taper Curve' }),
    curveV: num(1, { min: 0.1, max: 5, step: 0.1, label: 'Vertical Taper Curve' }),
    tailHeight: num(0, { min: -100, max: 100, step: 1, label: 'Tail Height' }),
    closeNose: { value: false, label: 'Close Nose' },
    closeTail: { value: false, label: 'Close Tail' },
    nosecapLength: num(20, { min: 1, max: 100, step: 1, label: 'Nose Cap Length' }),
    nosecapSharpness: num(1, { min: 0.1, max: 5, step: 0.1, label: 'Nose Cap Sharpness' }),
    tailcapLength: num(20, { min: 1, max: 100, step: 1, label: 'Tail Cap Length' }),
    tailcapSharpness: num(1, { min: 0.1, max: 5, step: 0.1, label: 'Tail Cap Sharpness' }),
    showCrossSections: { value: false, label: 'Show Cross Sections' },
    segmentCount: num(10, { min: 2, max: 50, step: 1, label: 'Segment Count' }),
  }, { render: () => !showAirfoilControls });

  const {
    showNacelles,
    nacelleRadius,
    nacelleLength,
  } = useControls('Nacelles', {
    showNacelles: false,
    nacelleRadius: num(10, { min: 1, max: 100, step: 1, label: 'Radius' }),
    nacelleLength: num(40, { min: 10, max: 200, step: 1, label: 'Length' }),
  }, { render: () => !showAirfoilControls });

  const {
    showRudder,
    rudderHeight,
    rootChord,
    tipChord,
    rudderSweep,
    rudderThickness,
    rudderOffset,
  } = useControls('Rudder', {
    showRudder: false,
    rudderHeight: num(40, { min: 10, max: 100, step: 1, label: 'Height' }),
    rootChord: num(30, { min: 10, max: 100, step: 1, label: 'Root Chord' }),
    tipChord: num(0, { min: 0, max: 100, step: 1, label: 'Tip Chord' }),
    rudderSweep: num(0, { min: -300, max: 300, step: 1, label: 'Sweep' }),
    rudderThickness: num(2, { min: 1, max: 10, step: 0.5, label: 'Thickness' }),
    rudderOffset: num(0, { min: -100, max: 100, step: 1, label: 'Offset' }),
  });

  const {
    showElevator,
    elevatorRootChord,
    elevatorTipChord,
    elevatorSpan,
    elevatorSweep,
    elevatorDihedral,
    elevatorThickness,
    elevatorCamber,
    elevatorCamberPos,
    elevatorAngle,
    elevatorOffset,
  } = useControls('Elevator', {
    showElevator: false,
    elevatorRootChord: num(50, { min: 10, max: 200, step: 1, label: 'Root Chord' }),
    elevatorTipChord: num(50, { min: 10, max: 200, step: 1, label: 'Tip Chord' }),
    elevatorSpan: num(80, { min: 10, max: 300, step: 1, label: 'Span' }),
    elevatorSweep: num(0, { min: -45, max: 45, step: 1, label: 'Sweep (°)' }),
    elevatorDihedral: num(0, { min: -20, max: 20, step: 0.1, label: 'Dihedral (°)' }),
    elevatorThickness: num(0.12, { min: 0.05, max: 0.25, label: 'Thickness' }),
    elevatorCamber: num(0.02, { min: 0, max: 0.1, label: 'Camber' }),
    elevatorCamberPos: num(0.4, { min: 0.1, max: 0.9, label: 'Camber Pos' }),
    elevatorAngle: num(0, { min: -15, max: 15, step: 0.1, label: 'Angle of Attack (°)' }),
    elevatorOffset: num(-32, { min: -100, max: 100, step: 1, label: 'Offset' }),
  });

  const sections = [rootParams];
  if (enablePanel1) sections.push(panel1Params);
  if (enablePanel2) sections.push(panel2Params);
  sections.push(tipParams);

  const previewElements = (
    <>
      <AirfoilPreview
        key={`root-${JSON.stringify(rootParams)}`}
        chord={rootParams.chord}
        thickness={rootParams.thickness}
        camber={rootParams.camber}
        camberPos={rootParams.camberPos}
        angle={rootParams.angle}
        label="Wing Root"
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
        label="Wing Tip"
      />
    </>
  );

  // Center the orbit controls on the aircraft when it is first rendered
  useEffect(() => {
    if (!controlsRef.current || !groupRef.current) return;
    const box = new THREE.Box3().setFromObject(groupRef.current);
    const center = new THREE.Vector3();
    box.getCenter(center);
    const camera = controlsRef.current.object;
    const offset = new THREE.Vector3().subVectors(camera.position, controlsRef.current.target);
    controlsRef.current.target.copy(center);
    camera.position.copy(center.clone().add(offset));
    controlsRef.current.update();
  }, []);

  return (
    <div id="app" style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar: Controls + Previews */}
      <div style={{
        width: '340px',
        backgroundColor: '#b2bfbf',
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
          theme={{ colors: { elevation1: '#d1ebeb' } }}
        />
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, position: 'relative', height: '100%', overflowY: 'auto' }}>
        {showAirfoilControls ? (
          <div style={{ padding: '10px' }}>{previewElements}</div>
        ) : (
          <>
            <Canvas style={{ width: '100%', height: '100%' }} camera={{ position: [0, 0, 400], fov: 50 }}>
              <ResizeHandler />
              <CameraCenter controlsRef={controlsRef} targetGroup={groupRef} />
              <ambientLight intensity={0.5} />
              <directionalLight position={[1, 2, 3]} intensity={1} />
              <Aircraft
                groupRef={groupRef}
                sections={sections}
                sweep={sweep}
                mirrored={mirrored}
                mountHeight={mountHeight}
                mountZ={mountZ}
                showNacelles={showNacelles}
                nacelleRadius={nacelleRadius}
                nacelleLength={nacelleLength}
                showRudder={showRudder}
                rudderHeight={rudderHeight}
                rootChord={rootChord}
                tipChord={tipChord}
                rudderSweep={rudderSweep}
                rudderThickness={rudderThickness}
                rudderOffset={rudderOffset}
                showElevator={showElevator}
                elevatorRootChord={elevatorRootChord}
                elevatorTipChord={elevatorTipChord}
                elevatorSpan={elevatorSpan}
                elevatorSweep={elevatorSweep}
                elevatorDihedral={elevatorDihedral}
                elevatorThickness={elevatorThickness}
                elevatorCamber={elevatorCamber}
                elevatorCamberPos={elevatorCamberPos}
                elevatorAngle={elevatorAngle}
                elevatorOffset={elevatorOffset}
                showFuselage={fuselageParams.showFuselage}
                fuselageParams={fuselageParams}
              />
              <OrbitControls ref={controlsRef} />
              <ViewControls controls={controlsRef} targetGroup={groupRef} />
            </Canvas>
            <div
              style={{
                position: 'absolute',
                bottom: 20,
                left: 20,
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <MiniView position={[0, 0, 400]} up={[0, 1, 0]}>
                <Aircraft
                  sections={sections}
                  sweep={sweep}
                  mirrored={mirrored}
                  mountHeight={mountHeight}
                  mountZ={mountZ}
                  showNacelles={showNacelles}
                  nacelleRadius={nacelleRadius}
                  nacelleLength={nacelleLength}
                  showRudder={showRudder}
                  rudderHeight={rudderHeight}
                  rootChord={rootChord}
                  tipChord={tipChord}
                  rudderSweep={rudderSweep}
                  rudderThickness={rudderThickness}
                  rudderOffset={rudderOffset}
                showElevator={showElevator}
                elevatorRootChord={elevatorRootChord}
                elevatorTipChord={elevatorTipChord}
                elevatorSpan={elevatorSpan}
                elevatorSweep={elevatorSweep}
                elevatorDihedral={elevatorDihedral}
                elevatorThickness={elevatorThickness}
                elevatorCamber={elevatorCamber}
                elevatorCamberPos={elevatorCamberPos}
                elevatorAngle={elevatorAngle}
                elevatorOffset={elevatorOffset}
                showFuselage={fuselageParams.showFuselage}
                fuselageParams={fuselageParams}
            
               />
              </MiniView>
              <MiniView position={[0, 400, 0]} up={[0, 0, 1]}>
                <Aircraft
                  sections={sections}
                  sweep={sweep}
                  mirrored={mirrored}
                  mountHeight={mountHeight}
                  mountZ={mountZ}
                  showNacelles={showNacelles}
                  nacelleRadius={nacelleRadius}
                  nacelleLength={nacelleLength}
                  showRudder={showRudder}
                  rudderHeight={rudderHeight}
                  rootChord={rootChord}
                  tipChord={tipChord}
                  rudderSweep={rudderSweep}
                  rudderThickness={rudderThickness}
                  rudderOffset={rudderOffset}
                showElevator={showElevator}
                elevatorRootChord={elevatorRootChord}
                elevatorTipChord={elevatorTipChord}
                elevatorSpan={elevatorSpan}
                elevatorSweep={elevatorSweep}
                elevatorDihedral={elevatorDihedral}
                elevatorThickness={elevatorThickness}
                elevatorCamber={elevatorCamber}
                elevatorCamberPos={elevatorCamberPos}
                elevatorAngle={elevatorAngle}
                elevatorOffset={elevatorOffset}
                showFuselage={fuselageParams.showFuselage}
                fuselageParams={fuselageParams}
                />
              </MiniView>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
