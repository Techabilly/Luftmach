import React, { useState } from 'react';
import {
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useUi } from '../ui/UiContext.jsx';

export default function AddPartsDrawer() {
  const { registry, enabledParts, enablePart, selectPart } = useUi();
  const [open, setOpen] = useState(false);

  const disabled = Object.values(registry).filter(
    (p) => !enabledParts.includes(p.id)
  );

  return (
    <>
      <IconButton
        size="small"
        color="inherit"
        onClick={() => setOpen(true)}
        aria-label="add parts"
      >
        <AddIcon />
      </IconButton>
      <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
        <List sx={{ width: 250 }}>
          {disabled.map((p) => (
            <ListItemButton
              key={p.id}
              onClick={() => {
                enablePart(p.id);
                selectPart(p.id);
                setOpen(false);
              }}
            >
              <ListItemText primary={p.label} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>
    </>
  );
}
