import React from 'react';
import { Box, Typography } from '@mui/material';

export default function TemplateStep() {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Templates
      </Typography>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6">Personal</Typography>
        <Typography>Your saved templates will appear here.</Typography>
      </Box>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6">Public</Typography>
        <Typography>Explore templates shared by the community.</Typography>
      </Box>
      <Box>
        <Typography variant="h6">Basic</Typography>
        <Typography>Start from a simple preset.</Typography>
      </Box>
    </Box>
  );
}
