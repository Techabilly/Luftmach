import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useControls } from 'leva';
import { resetNumber } from './components/ResetNumberPlugin';
import PartsDrawer from './components/PartsDrawer.jsx';
import ControlsPanel from './components/ControlsPanel.jsx';
import { Leva } from 'leva';
import { useUi } from './ui/UiContext.jsx';
import { AppBar, Toolbar, Box } from '@mui/material';

function num(value, settings = {}) {
  return { value, component: resetNumber, ...settings };
}
import './App.css';
import AirfoilPreview from './components/AirfoilPreview';
import ViewControls from './components/ViewControls';
import Aircraft from './components/Aircraft';
import MiniView from './components/MiniView';
import ThemeSwitcher from './components/ThemeSwitcher';
import { hsvToHex, adjustHSV } from './lib/color';
import { fitCameraToObject } from './lib/camera';
function ResizeHandler() {
  const { camera, size } = useThree();
  useEffect(() => {
    camera.aspect = size.width / size.height;
    camera.updateProjectionMatrix();
  }, [camera, size]);
  return null;
}

function CameraCenter({ controlsRef, targetGroup, enabledParts }) {
  const { camera, size } = useThree();
  useEffect(() => {
    if (!controlsRef.current || !targetGroup.current) return;
    fitCameraToObject(camera, controlsRef.current, targetGroup.current, size);
  }, [camera, controlsRef, targetGroup, size, enabledParts]);
  return null;
}
// Trigger rebuild
export default function App({ showAirfoilControls = false } = {}) {
  const { selectPart, enabledParts } = useUi();
  const [color, setColor] = useState({ h: 200, s: 60, v: 50 });

  const themeColors = useMemo(() => {
    const link = hsvToHex(color.h, color.s, color.v);
    const { h: hh, s: hs, v: hv } = adjustHSV(color, { dv: 10 });
    const linkHover = hsvToHex(hh, hs, hv);
    const { h: bh, s: bs, v: bv } = adjustHSV(color, { dv: -20, ds: -20 });
    const buttonBg = hsvToHex(bh, bs, bv);
    const { h: gh, s: gs, v: gv } = adjustHSV(color, { ds: -80, dv: 40 });
    const bgColor = hsvToHex(gh, gs, gv);
    const { h: th, s: ts, v: tv } = adjustHSV(color, { ds: -80, dv: -40 });
    const textColor = hsvToHex(th, ts, tv);
    return { link, linkHover, buttonBg, bgColor, textColor };
  }, [color]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--link-color', themeColors.link);
    root.style.setProperty('--link-hover', themeColors.linkHover);
    root.style.setProperty('--button-bg', themeColors.buttonBg);
    root.style.setProperty('--bg-color', themeColors.bgColor);
    root.style.setProperty('--text-color', themeColors.textColor);
    root.style.color = themeColors.textColor;
    root.style.backgroundColor = themeColors.bgColor;
  }, [themeColors]);

  const levaTheme = useMemo(
    () => ({
      colors: {
        elevation1: themeColors.bgColor,
        elevation2: themeColors.buttonBg,
        highlight1: themeColors.linkHover,
        accent1: themeColors.link,
        accent2: themeColors.linkHover,
        text: themeColors.textColor,
      },
    }),
    [themeColors]
  );

  const controlsRef = useRef();
  const groupRef = useRef();
  const [viewport, setViewport] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () =>
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
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
  }, { render: () => enabledParts.includes('wing') });

  const rootParams = useControls('Wing Root Section', {
    chord: num(100, { min: 20, max: 400, render: () => !showAirfoilControls }),
    thickness: num(0.12, { min: 0.05, max: 0.25, render: () => showAirfoilControls }),
    camber: num(0.02, { min: 0, max: 0.1, render: () => showAirfoilControls }),
    camberPos: num(0.4, { min: 0.1, max: 0.9, render: () => showAirfoilControls }),
    length: num(150, { min: 10, max: 500, label: 'Panel Length' }),
    angle: num(0, { min: -15, max: 15, step: 0.1, label: 'Angle of Attack (°)' }),
    dihedral: num(0, { min: -20, max: 20, step: 0.1, label: 'Dihedral (°)' }),
  }, { render: () => enabledParts.includes('wing') });


  const panel1Params = useControls('Wing Panel 1 Airfoil', {
    chord: num(80, { min: 10, max: 400, render: () => !showAirfoilControls }),
    thickness: num(0.12, { min: 0.05, max: 0.25, render: () => showAirfoilControls }),
    camber: num(0.015, { min: 0, max: 0.1, render: () => showAirfoilControls }),
    camberPos: num(0.4, { min: 0.1, max: 0.9, render: () => showAirfoilControls }),
    length: num(150, { min: 10, max: 500, label: 'Panel Length' }),
    angle: num(0, { min: -15, max: 15, step: 0.1, label: 'Angle of Attack (°)' }),
    pivotPercent: num(100, { min: 0, max: 100, step: 1, label: 'Rotation Center (%)' }),
    dihedral: num(0, { min: -20, max: 20, step: 0.1, label: 'Dihedral (°)' }),
    nacelle: { value: false, label: 'Nacelle' },
    nacelleFin: {
      value: 'none',
      options: { None: 'none', Top: 'top', Bottom: 'bottom', Both: 'both' },
      label: 'Nacelle Fins',
      render: (get) => get('Wing Panel 1 Airfoil.nacelle'),
    },
  }, { render: (get) => enabledParts.includes('wing') && get('Wing Settings.enablePanel1') });

  const panel2Params = useControls('Wing Panel 2 Airfoil', {
    chord: num(70, { min: 10, max: 400, render: () => !showAirfoilControls }),
    thickness: num(0.12, { min: 0.05, max: 0.25, render: () => showAirfoilControls }),
    camber: num(0.015, { min: 0, max: 0.1, render: () => showAirfoilControls }),
    camberPos: num(0.4, { min: 0.1, max: 0.9, render: () => showAirfoilControls }),
    length: num(150, { min: 10, max: 500, label: 'Panel Length' }),
    angle: num(0, { min: -15, max: 15, step: 0.1, label: 'Angle of Attack (°)' }),
    pivotPercent: num(100, { min: 0, max: 100, step: 1, label: 'Rotation Center (%)' }),
    dihedral: num(0, { min: -20, max: 20, step: 0.1, label: 'Dihedral (°)' }),
    nacelle: { value: false, label: 'Nacelle' },
    nacelleFin: {
      value: 'none',
      options: { None: 'none', Top: 'top', Bottom: 'bottom', Both: 'both' },
      label: 'Nacelle Fins',
      render: (get) => get('Wing Panel 2 Airfoil.nacelle'),
    },
  }, { render: (get) => enabledParts.includes('wing') && get('Wing Settings.enablePanel2') });

  const tipParams = useControls('Wing Tip Airfoil', {
    chord: num(60, { min: 10, max: 400, render: () => !showAirfoilControls }),
    thickness: num(0.12, { min: 0.05, max: 0.25, render: () => showAirfoilControls }),
    camber: num(0.015, { min: 0, max: 0.1, render: () => showAirfoilControls }),
    camberPos: num(0.4, { min: 0.1, max: 0.9, render: () => showAirfoilControls }),
    angle: num(0, { min: -15, max: 15, step: 0.1, label: 'Angle of Attack (°)' }),
    pivotPercent: num(100, { min: 0, max: 100, step: 1, label: 'Rotation Center (%)' }),
    nacelle: { value: false, label: 'Nacelle' },
    nacelleFin: {
      value: 'none',
      options: { None: 'none', Top: 'top', Bottom: 'bottom', Both: 'both' },
      label: 'Nacelle Fins',
      render: (get) => get('Wing Tip Airfoil.nacelle'),
    },
  }, { render: () => enabledParts.includes('wing') });


  const fuselageParams = useControls('Fuselage Settings', {
    showFuselage: { value: true, label: 'Show Fuselage' },
    length: num(200, { min: 50, max: 600 }),
    frontWidth: num(40, { min: 10, max: 200, label: 'Front Width' }),
    frontHeight: num(40, { min: 10, max: 200, label: 'Front Height' }),
    backWidth: num(40, { min: 10, max: 200, label: 'Back Width' }),
    backHeight: num(40, { min: 10, max: 200, label: 'Back Height' }),
    cornerRadius: num(10, { min: 0, max: 50, label: 'Corner Radius' }),
    curveH: num(1, { min: 0.1, max: 5, step: 0.1, label: 'Width Curve' }),
    curveV: num(1, { min: 0.1, max: 5, step: 0.1, label: 'Height Curve' }),
    verticalAlign: num(0.5, { min: 0, max: 1, step: 0.01, label: 'Vertical Align' }),
    tailHeight: num(0, { min: -100, max: 100, step: 1, label: 'Tail Height' }),
    closeNose: { value: false, label: 'Close Nose' },
    closeTail: { value: false, label: 'Close Tail' },
    nosecapLength: num(20, { min: 1, max: 100, step: 1, label: 'Nose Cap Length' }),
    tailcapLength: num(20, { min: 1, max: 100, step: 1, label: 'Tail Cap Length' }),
    showCrossSections: { value: false, label: 'Show Cross Sections' },
    segmentCount: num(10, { min: 2, max: 50, step: 1, label: 'Segment Count' }),
  }, { render: () => enabledParts.includes('fuselage') && !showAirfoilControls });

  const panel1NacelleParams = useControls(
    'Wing Panel 1 Nacelle',
    {
      length: num(40, { min: 10, max: 200, step: 1, label: 'Length' }),
      frontWidth: num(20, { min: 1, max: 100, step: 1, label: 'Front Width' }),
      frontHeight: num(20, { min: 1, max: 100, step: 1, label: 'Front Height' }),
      backWidth: num(20, { min: 1, max: 100, step: 1, label: 'Back Width' }),
      backHeight: num(20, { min: 1, max: 100, step: 1, label: 'Back Height' }),
      cornerRadius: num(5, { min: 0, max: 50, step: 1, label: 'Corner Radius' }),
      curveH: num(1, { min: 0.1, max: 5, step: 0.1, label: 'Width Curve' }),
      curveV: num(1, { min: 0.1, max: 5, step: 0.1, label: 'Height Curve' }),
      verticalAlign: num(0.5, { min: 0, max: 1, step: 0.01, label: 'Vertical Align' }),
      tailHeight: num(0, { min: -50, max: 50, step: 1, label: 'Tail Height' }),
      closeNose: { value: false, label: 'Close Nose' },
      closeTail: { value: false, label: 'Close Tail' },
      nosecapLength: num(5, { min: 0, max: 50, step: 1, label: 'Nose Cap Length' }),
      tailcapLength: num(5, { min: 0, max: 50, step: 1, label: 'Tail Cap Length' }),
      segmentCount: num(10, { min: 2, max: 50, step: 1, label: 'Segment Count' }),
      finHeight: num(10, { min: 1, max: 100, step: 1, label: 'Fin Height' }),
      finRootChord: num(15, { min: 1, max: 100, step: 1, label: 'Fin Root Chord' }),
      finTipChord: num(0, { min: 0, max: 100, step: 1, label: 'Fin Tip Chord' }),
      finSweep: num(0, { min: -300, max: 300, step: 1, label: 'Fin Sweep' }),
      finThickness: num(1, { min: 0.1, max: 10, step: 0.1, label: 'Fin Thickness' }),
      finOffset: num(0, { min: -100, max: 100, step: 1, label: 'Fin Offset' }),
      finFrontCornerRadius: num(0, { min: 0, max: 50, step: 1, label: 'Fin Front Top Radius' }),
      finBackCornerRadius: num(0, { min: 0, max: 50, step: 1, label: 'Fin Back Top Radius' }),
      topFinAngle: num(45, { min: -180, max: 180, step: 1, label: 'Top Fin Angle (°)' }),
      bottomFinAngle: num(-45, { min: -180, max: 180, step: 1, label: 'Bottom Fin Angle (°)' }),
    },
    {
      render: (get) =>
        enabledParts.includes('wing') &&
        enabledParts.includes('nacelle') &&
        get('Wing Settings.enablePanel1') &&
        get('Wing Panel 1 Airfoil.nacelle') &&
        !showAirfoilControls,
    },
  );

  const panel2NacelleParams = useControls(
    'Wing Panel 2 Nacelle',
    {
      length: num(40, { min: 10, max: 200, step: 1, label: 'Length' }),
      frontWidth: num(20, { min: 1, max: 100, step: 1, label: 'Front Width' }),
      frontHeight: num(20, { min: 1, max: 100, step: 1, label: 'Front Height' }),
      backWidth: num(20, { min: 1, max: 100, step: 1, label: 'Back Width' }),
      backHeight: num(20, { min: 1, max: 100, step: 1, label: 'Back Height' }),
      cornerRadius: num(5, { min: 0, max: 50, step: 1, label: 'Corner Radius' }),
      curveH: num(1, { min: 0.1, max: 5, step: 0.1, label: 'Width Curve' }),
      curveV: num(1, { min: 0.1, max: 5, step: 0.1, label: 'Height Curve' }),
      verticalAlign: num(0.5, { min: 0, max: 1, step: 0.01, label: 'Vertical Align' }),
      tailHeight: num(0, { min: -50, max: 50, step: 1, label: 'Tail Height' }),
      closeNose: { value: false, label: 'Close Nose' },
      closeTail: { value: false, label: 'Close Tail' },
      nosecapLength: num(5, { min: 0, max: 50, step: 1, label: 'Nose Cap Length' }),
      tailcapLength: num(5, { min: 0, max: 50, step: 1, label: 'Tail Cap Length' }),
      segmentCount: num(10, { min: 2, max: 50, step: 1, label: 'Segment Count' }),
      finHeight: num(10, { min: 1, max: 100, step: 1, label: 'Fin Height' }),
      finRootChord: num(15, { min: 1, max: 100, step: 1, label: 'Fin Root Chord' }),
      finTipChord: num(0, { min: 0, max: 100, step: 1, label: 'Fin Tip Chord' }),
      finSweep: num(0, { min: -300, max: 300, step: 1, label: 'Fin Sweep' }),
      finThickness: num(1, { min: 0.1, max: 10, step: 0.1, label: 'Fin Thickness' }),
      finOffset: num(0, { min: -100, max: 100, step: 1, label: 'Fin Offset' }),
      finFrontCornerRadius: num(0, { min: 0, max: 50, step: 1, label: 'Fin Front Top Radius' }),
      finBackCornerRadius: num(0, { min: 0, max: 50, step: 1, label: 'Fin Back Top Radius' }),
      topFinAngle: num(45, { min: -180, max: 180, step: 1, label: 'Top Fin Angle (°)' }),
      bottomFinAngle: num(-45, { min: -180, max: 180, step: 1, label: 'Bottom Fin Angle (°)' }),
    },
    {
      render: (get) =>
        enabledParts.includes('wing') &&
        enabledParts.includes('nacelle') &&
        get('Wing Settings.enablePanel2') &&
        get('Wing Panel 2 Airfoil.nacelle') &&
        !showAirfoilControls,
    },
  );

  const tipNacelleParams = useControls(
    'Wing Tip Nacelle',
    {
      length: num(40, { min: 10, max: 200, step: 1, label: 'Length' }),
      frontWidth: num(20, { min: 1, max: 100, step: 1, label: 'Front Width' }),
      frontHeight: num(20, { min: 1, max: 100, step: 1, label: 'Front Height' }),
      backWidth: num(20, { min: 1, max: 100, step: 1, label: 'Back Width' }),
      backHeight: num(20, { min: 1, max: 100, step: 1, label: 'Back Height' }),
      cornerRadius: num(5, { min: 0, max: 50, step: 1, label: 'Corner Radius' }),
      curveH: num(1, { min: 0.1, max: 5, step: 0.1, label: 'Width Curve' }),
      curveV: num(1, { min: 0.1, max: 5, step: 0.1, label: 'Height Curve' }),
      verticalAlign: num(0.5, { min: 0, max: 1, step: 0.01, label: 'Vertical Align' }),
      tailHeight: num(0, { min: -50, max: 50, step: 1, label: 'Tail Height' }),
      closeNose: { value: false, label: 'Close Nose' },
      closeTail: { value: false, label: 'Close Tail' },
      nosecapLength: num(5, { min: 0, max: 50, step: 1, label: 'Nose Cap Length' }),
      tailcapLength: num(5, { min: 0, max: 50, step: 1, label: 'Tail Cap Length' }),
      segmentCount: num(10, { min: 2, max: 50, step: 1, label: 'Segment Count' }),
      finHeight: num(10, { min: 1, max: 100, step: 1, label: 'Fin Height' }),
      finRootChord: num(15, { min: 1, max: 100, step: 1, label: 'Fin Root Chord' }),
      finTipChord: num(0, { min: 0, max: 100, step: 1, label: 'Fin Tip Chord' }),
      finSweep: num(0, { min: -300, max: 300, step: 1, label: 'Fin Sweep' }),
      finThickness: num(1, { min: 0.1, max: 10, step: 0.1, label: 'Fin Thickness' }),
      finOffset: num(0, { min: -100, max: 100, step: 1, label: 'Fin Offset' }),
      finFrontCornerRadius: num(0, { min: 0, max: 50, step: 1, label: 'Fin Front Top Radius' }),
      finBackCornerRadius: num(0, { min: 0, max: 50, step: 1, label: 'Fin Back Top Radius' }),
      topFinAngle: num(45, { min: -180, max: 180, step: 1, label: 'Top Fin Angle (°)' }),
      bottomFinAngle: num(-45, { min: -180, max: 180, step: 1, label: 'Bottom Fin Angle (°)' }),
    },
    {
      render: (get) =>
        enabledParts.includes('wing') &&
        enabledParts.includes('nacelle') &&
        get('Wing Tip Airfoil.nacelle') &&
        !showAirfoilControls,
    },
  );

  const { showNacelles } = useControls(
    'Nacelle Toggle',
    { showNacelles: false },
    {
      render: () =>
        enabledParts.includes('wing') &&
        enabledParts.includes('nacelle') &&
        !showAirfoilControls,
    },
  );

  const {
    showRudder,
    rudderHeight,
    rootChord,
    tipChord,
    rudderSweep,
    rudderThickness,
    rudderOffset,
    frontCornerRadius,
    backCornerRadius,
  } = useControls('Rudder Settings', {
    showRudder: false,
    rudderHeight: num(40, { min: 10, max: 100, step: 1, label: 'Height' }),
    rootChord: num(30, { min: 10, max: 100, step: 1, label: 'Root Chord' }),
    tipChord: num(0, { min: 0, max: 100, step: 1, label: 'Tip Chord' }),
    rudderSweep: num(0, { min: -300, max: 300, step: 1, label: 'Sweep' }),
    rudderThickness: num(2, { min: 1, max: 10, step: 0.5, label: 'Thickness' }),
    rudderOffset: num(0, { min: -100, max: 100, step: 1, label: 'Offset' }),
    frontCornerRadius: num(0, { min: 0, max: 50, step: 1, label: 'Front Corner Radius' }),
    backCornerRadius: num(0, { min: 0, max: 50, step: 1, label: 'Back Corner Radius' }),
  }, { render: () => enabledParts.includes('rudder') && !showAirfoilControls });

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
  } = useControls('Elevator Settings', {
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
  }, { render: () => enabledParts.includes('elevator') && !showAirfoilControls });

  const sections = [rootParams];
  const nacelleFlags = [];
  const nacelleFins = [];
  const nacelleParamsList = [];
  if (enablePanel1) {
    sections.push(panel1Params);
    nacelleFlags.push(panel1Params.nacelle);
    nacelleFins.push(panel1Params.nacelleFin);
    nacelleParamsList.push(panel1NacelleParams);
    if (enablePanel2) {
      sections.push(panel2Params);
      nacelleFlags.push(panel2Params.nacelle);
      nacelleFins.push(panel2Params.nacelleFin);
      nacelleParamsList.push(panel2NacelleParams);
    }
  }
  sections.push(tipParams);
  nacelleFlags.push(tipParams.nacelle);
  nacelleFins.push(tipParams.nacelleFin);
  nacelleParamsList.push(tipNacelleParams);

  const previewElements = (
    <>
      <AirfoilPreview
        key={`root-${JSON.stringify(rootParams)}`}
        chord={rootParams.chord}
        thickness={rootParams.thickness}
        camber={rootParams.camber}
        camberPos={rootParams.camberPos}
        angle={rootParams.angle}
        label="Wing Root Section"
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
          label="Wing Panel 1 Airfoil"
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
          label="Wing Panel 2 Airfoil"
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
        label="Wing Tip Airfoil"
      />
    </>
  );


  return (
    <div
      id="app"
      style={{
        width: viewport.width,
        height: viewport.height,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <AppBar
        position="static"
        sx={{ background: 'var(--button-bg)', color: 'var(--text-color)' }}
      >
        <Toolbar>
          <PartsDrawer />
          <Box sx={{ flexGrow: 1 }} />
          <ThemeSwitcher color={color} setColor={setColor} />
        </Toolbar>
      </AppBar>
      <Box sx={{ display: 'flex', flex: 1, position: 'relative' }}>
        <Box sx={{ flex: 1, position: 'relative' }}>
          {showAirfoilControls ? (
            <Box sx={{ p: 2 }}>{previewElements}</Box>
          ) : (
            <>
              <Canvas
                style={{ width: '100%', height: '100%' }}
                camera={{ position: [0, 0, 400], fov: 50 }}
                onPointerMissed={() => selectPart(null)}
              >
                <ResizeHandler />
                <CameraCenter
                  controlsRef={controlsRef}
                  targetGroup={groupRef}
                  enabledParts={enabledParts}
                />
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
                nacelleParamsList={nacelleParamsList}
                nacelleFlags={nacelleFlags}
                nacelleFins={nacelleFins}
                showRudder={showRudder}
                rudderHeight={rudderHeight}
                rootChord={rootChord}
                tipChord={tipChord}
                rudderSweep={rudderSweep}
                rudderThickness={rudderThickness}
                rudderOffset={rudderOffset}
                frontCornerRadius={frontCornerRadius}
                backCornerRadius={backCornerRadius}
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
            </Canvas>
            <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
              <ViewControls controls={controlsRef} targetGroup={groupRef} />
            </Box>
            <Box
              sx={{
                position: 'absolute',
                bottom: 20,
                left: 20,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
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
                  nacelleParamsList={nacelleParamsList}
                  nacelleFlags={nacelleFlags}
                  nacelleFins={nacelleFins}
                  showRudder={showRudder}
                  rudderHeight={rudderHeight}
                  rootChord={rootChord}
                  tipChord={tipChord}
                  rudderSweep={rudderSweep}
                  rudderThickness={rudderThickness}
                  rudderOffset={rudderOffset}
                  frontCornerRadius={frontCornerRadius}
                  backCornerRadius={backCornerRadius}
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
                  nacelleParamsList={nacelleParamsList}
                  nacelleFlags={nacelleFlags}
                  nacelleFins={nacelleFins}
                  showRudder={showRudder}
                  rudderHeight={rudderHeight}
                  rootChord={rootChord}
                  tipChord={tipChord}
                  rudderSweep={rudderSweep}
                  rudderThickness={rudderThickness}
                  rudderOffset={rudderOffset}
                  frontCornerRadius={frontCornerRadius}
                  backCornerRadius={backCornerRadius}
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
            </Box>
          </>
        )}
        </Box>
        <Box
          sx={{
            width: 340,
            p: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            overflow: 'auto',
          }}
        >
          <ControlsPanel />
          <Leva collapsed={false} fill theme={levaTheme} />
        </Box>
      </Box>
    </div>
  );
}
