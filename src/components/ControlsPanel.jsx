import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useUi } from '../ui/UiContext.jsx';

export default function ControlsPanel() {
  const {
    registry,
    enabledParts,
    selectedPartId,
    selectPart,
    disablePart,
  } = useUi();

  if (!selectedPartId) {
    return (
      <Box sx={{ width: 300, p: 1 }}>
        <Typography variant="h6" gutterBottom>
          Aircraft / View
        </Typography>
        <Typography variant="body2">No part selected.</Typography>
      </Box>
    );
  }

  if (!enabledParts.includes(selectedPartId)) {
    const item = registry[selectedPartId];
    return (
      <Box sx={{ width: 300, p: 1 }}>
        <Typography variant="body2" sx={{ mb: 1 }}>
          This part isn’t added. Add it in Parts Manager.
        </Typography>
      </Box>
    );
  }

  const item = registry[selectedPartId];
  if (!item) return null;
  const Controls = item.Controls;

  return (
    <Box sx={{ width: 300, overflow: 'auto', p: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="h6">{item.label}</Typography>
        <IconButton
          size="small"
          onClick={() => {
            disablePart(item.id);
            selectPart(null);
          }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Box>
      {Controls ? <Controls partId={selectedPartId} /> : null}
    </Box>
  );
}

