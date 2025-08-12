import React from 'react';
import { useAuth } from '../../auth/AuthContext.jsx';
import RequireAuth from '../../auth/RequireAuth.jsx';
import { Box, Typography } from '@mui/material';

export default function ExportStep({ onOpenAuth }) {
  const { user } = useAuth();
  if (!user) {
    return <RequireAuth onOpenAuth={onOpenAuth}> </RequireAuth>;
  }
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Export
      </Typography>
      <Typography>
        Prepare your layout for fabrication in SVG or DXF format.
      </Typography>
    </Box>
  );
}
