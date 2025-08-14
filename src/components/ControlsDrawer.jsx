import React from 'react';
import { Drawer, Box } from '@mui/material';
import ControlsPanel from './ControlsPanel.jsx';
import { Leva } from 'leva';

export default function ControlsDrawer({ open, onClose, levaTheme }) {
  return (
    <Drawer anchor="left" open={open} onClose={onClose}>
      <Box sx={{ width: 340, p: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <ControlsPanel />
        <Leva collapsed={false} fill theme={levaTheme} />
      </Box>
    </Drawer>
  );
}
