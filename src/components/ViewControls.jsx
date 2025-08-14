import React from 'react';
import * as THREE from 'three';
import { Paper, IconButton } from '@mui/material';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';

export default function ViewControls({ controls, targetGroup }) {
  const getCamera = () => (controls.current ? controls.current.object : null);

  const centerView = () => {
    const camera = getCamera();
    if (!camera || !controls.current || !targetGroup.current) return;
    const box = new THREE.Box3().setFromObject(targetGroup.current);
    const c = new THREE.Vector3();
    box.getCenter(c);
    const offset = new THREE.Vector3().subVectors(camera.position, controls.current.target);
    controls.current.target.copy(c);
    camera.position.copy(c.clone().add(offset));
    controls.current.update();
  };

  return (
    <Paper elevation={3} sx={{ display: 'flex' }}>
      <IconButton size="small" onClick={centerView} aria-label="center view">
        <CenterFocusStrongIcon fontSize="small" />
      </IconButton>
    </Paper>
  );
}
