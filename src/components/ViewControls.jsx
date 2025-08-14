import React from 'react';
import { Paper, IconButton } from '@mui/material';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import { fitCameraToObject } from '../lib/camera';

export default function ViewControls({ controls, targetGroup }) {
  const getCamera = () => (controls.current ? controls.current.object : null);

  const centerView = () => {
    const camera = getCamera();
    if (!camera || !controls.current || !targetGroup.current) return;
    const { clientWidth: width, clientHeight: height } = controls.current.domElement;
    fitCameraToObject(camera, controls.current, targetGroup.current, { width, height });
  };

  return (
    <Paper elevation={3} sx={{ display: 'flex' }}>
      <IconButton size="small" onClick={centerView} aria-label="center view">
        <CenterFocusStrongIcon fontSize="small" />
      </IconButton>
    </Paper>
  );
}
