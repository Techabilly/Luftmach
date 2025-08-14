import React, { useState } from 'react';
import {
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DeleteIcon from '@mui/icons-material/Delete';
import { useUi } from '../ui/UiContext.jsx';

export default function PartsDrawer() {
  const {
    registry,
    enabledParts,
    enablePart,
    disablePart,
    selectPart,
    selectedPartId,
  } = useUi();
  const [open, setOpen] = useState(false);

  const parts = Object.values(registry);

  return (
    <>
      <IconButton
        color="inherit"
        edge="start"
        onClick={() => setOpen(true)}
        aria-label="open parts manager"
      >
        <MenuIcon />
      </IconButton>
      <Drawer anchor="left" open={open} onClose={() => setOpen(false)}>
        <List sx={{ width: 250 }}>
          {parts.map((p) => {
            const enabled = enabledParts.includes(p.id);
            return (
              <ListItemButton
                key={p.id}
                selected={selectedPartId === p.id}
                onClick={() => {
                  if (!enabled) enablePart(p.id);
                  selectPart(p.id);
                  setOpen(false);
                }}
              >
                <ListItemText primary={p.label} />
                {enabled && (
                  <IconButton
                    edge="end"
                    onClick={(e) => {
                      e.stopPropagation();
                      disablePart(p.id);
                      if (selectedPartId === p.id) selectPart(null);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </ListItemButton>
            );
          })}
        </List>
      </Drawer>
    </>
  );
}

