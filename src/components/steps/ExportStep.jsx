import React from 'react';
import { useAuth } from '../../auth/AuthContext.jsx';
import RequireAuth from '../../auth/RequireAuth.jsx';
import { Box, Typography, List, ListItem, ListItemText } from '@mui/material';
import { useUi } from '../../ui/UiContext.jsx';

export default function ExportStep({ onOpenAuth }) {
  const { user } = useAuth();
  const { enabledParts } = useUi();
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
      <List>
        {enabledParts.map((id) => (
          <ListItem key={id}>
            <ListItemText primary={id} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
