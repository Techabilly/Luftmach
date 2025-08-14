import React, { useState } from 'react';
import { IconButton, Popover, Stack, Slider } from '@mui/material';
import PaletteIcon from '@mui/icons-material/Palette';

export default function ThemeSwitcher({ color, setColor }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleOpen = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const update = (key) => (_e, value) => setColor({ ...color, [key]: value });

  return (
    <>
      <IconButton color="inherit" onClick={handleOpen} aria-label="theme settings">
        <PaletteIcon />
      </IconButton>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Stack sx={{ p: 2, width: 200 }} spacing={2}>
          <Slider value={color.h} min={0} max={360} onChange={update('h')} />
          <Slider value={color.s} min={0} max={100} onChange={update('s')} />
          <Slider value={color.v} min={0} max={100} onChange={update('v')} />
        </Stack>
      </Popover>
    </>
  );
}
