import React from 'react';
import { Box, Collapse, Paper, Typography } from '@mui/material';
import { useUi } from '../ui/UiContext.jsx';

export default function ControlsPanel() {
  const { registry, enabledParts, selectedPartId, selectPart } = useUi();

  return (
    <Box sx={{ width: 300, overflow: 'auto', p: 1 }}>
      {enabledParts.map((id) => {
        const item = registry[id];
        if (!item) return null;
        const Controls = item.Controls;
        const open = selectedPartId === id;
        return (
          <Paper key={id} sx={{ mb: 1 }}>
            <Typography
              sx={{ p: 1, cursor: 'pointer', fontWeight: open ? 'bold' : 'normal' }}
              onClick={() => selectPart(open ? null : id)}
            >
              {item.label}
            </Typography>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box sx={{ p: 1 }}>{Controls ? <Controls partId={id} /> : null}</Box>
            </Collapse>
          </Paper>
        );
      })}
    </Box>
  );
}
