import React from 'react';
import DesignApp from '../../App.jsx';
import { useAuth } from '../../auth/AuthContext.jsx';
import { getDesignState, getDesignThumbnail } from '../../lib/designState.js';
import { Box, Button, Stack } from '@mui/material';

export default function BuildStep({ onSave, onSaveAs, onLoad }) {
  const { user } = useAuth();
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {user && (
        <Stack direction="row" spacing={1} sx={{ p: 1 }}>
          <Button
            variant="contained"
            onClick={() =>
              onSave({ data: getDesignState(), thumbnail: getDesignThumbnail() })
            }
            disabled={!user}
          >
            Save
          </Button>
          <Button
            variant="contained"
            onClick={() =>
              onSaveAs({ data: getDesignState(), thumbnail: getDesignThumbnail() })
            }
            disabled={!user}
          >
            Save as…
          </Button>
          <Button variant="contained" onClick={onLoad} disabled={!user}>
            Load
          </Button>
        </Stack>
      )}
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <DesignApp showAirfoilControls={false} />
      </Box>
    </Box>
  );
}
