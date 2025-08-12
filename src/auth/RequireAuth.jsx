import React from 'react';
import { useAuth } from './AuthContext.jsx';
import { Box, Button, Typography, CircularProgress } from '@mui/material';

export default function RequireAuth({ children, onOpenAuth }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          gap: 2,
        }}
      >
        <Typography>Sign in to continue</Typography>
        <Button variant="contained" onClick={onOpenAuth}>
          Sign in
        </Button>
      </Box>
    );
  }

  return children;
}
