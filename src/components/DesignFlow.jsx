import React, { useState } from 'react';
import TemplateStep from './steps/TemplateStep.jsx';
import BuildStep from './steps/BuildStep.jsx';
import AirfoilStep from './steps/AirfoilStep.jsx';
import ExportStep from './steps/ExportStep.jsx';
import AuthModal from '../auth/AuthModal.jsx';
import { useAuth } from '../auth/AuthContext.jsx';
import {
  createDesign,
  deleteDesign,
  listDesigns,
  updateDesign,
} from '../data/designsApi.js';
import { setDesignState } from '../lib/designState.js';
import {
  AppBar,
  Box,
  Toolbar,
  Tabs,
  Tab,
  Button,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
} from '@mui/material';

export default function DesignFlow() {
  const [current, setCurrent] = useState(0);
  const { user, signOut } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [currentDesignId, setCurrentDesignId] = useState(null);
  const [designs, setDesigns] = useState([]);
  const [showLoad, setShowLoad] = useState(false);
  const [userMenuEl, setUserMenuEl] = useState(null);

  const handleSave = async ({ data, thumbnail }) => {
    if (!user) return;
    if (currentDesignId) {
      await updateDesign(currentDesignId, { data, thumbnail });
    } else {
      await handleSaveAs({ data, thumbnail });
    }
  };

  const handleSaveAs = async ({ data, thumbnail }) => {
    if (!user) return;
    const name = window.prompt('Design name');
    if (!name) return;
    const row = await createDesign({ name, data, thumbnail });
    setCurrentDesignId(row.id);
  };

  const openLoad = async () => {
    const list = await listDesigns();
    setDesigns(list);
    setShowLoad(true);
  };

  const loadDesign = (design) => {
    setCurrentDesignId(design.id);
    setShowLoad(false);
    setDesignState(design.data);
  };

  const steps = [
    { label: 'Templates', component: <TemplateStep /> },
    {
      label: 'Build',
      component: (
        <BuildStep onSave={handleSave} onSaveAs={handleSaveAs} onLoad={openLoad} />
      ),
    },
    {
      label: 'Airfoils',
      component: (
        <AirfoilStep
          onSave={handleSave}
          onSaveAs={handleSaveAs}
          onLoad={openLoad}
        />
      ),
    },
    {
      label: 'Export',
      component: <ExportStep onOpenAuth={() => setShowAuth(true)} />,
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Tabs
            value={current}
            onChange={(e, v) => setCurrent(v)}
            textColor="inherit"
            indicatorColor="secondary"
            sx={{ flex: 1 }}
            variant="scrollable"
            scrollButtons="auto"
          >
            {steps.map((step) => (
              <Tab key={step.label} label={step.label} />
            ))}
          </Tabs>
          {user ? (
            <>
              <Button color="inherit" onClick={(e) => setUserMenuEl(e.currentTarget)}>
                {user.email}
              </Button>
              <Menu
                anchorEl={userMenuEl}
                open={Boolean(userMenuEl)}
                onClose={() => setUserMenuEl(null)}
              >
                <MenuItem
                  onClick={() => {
                    openLoad();
                    setUserMenuEl(null);
                  }}
                >
                  My Designs
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    signOut();
                    setUserMenuEl(null);
                  }}
                >
                  Sign out
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button color="inherit" onClick={() => setShowAuth(true)}>
              Sign in
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <Box sx={{ flex: 1, overflow: 'hidden' }}>{steps[current].component}</Box>
      <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />
      <Dialog open={showLoad} onClose={() => setShowLoad(false)} fullWidth>
        <DialogTitle>My Designs</DialogTitle>
        <List>
          {designs.map((d) => (
            <ListItem key={d.id} divider>
              {d.thumbnail && (
                <ListItemAvatar>
                  <Avatar
                    variant="square"
                    src={d.thumbnail}
                    alt={d.name}
                    sx={{ width: 40, height: 40 }}
                  />
                </ListItemAvatar>
              )}
              <ListItemText
                primary={d.name}
                onClick={() => loadDesign(d)}
                sx={{ cursor: 'pointer' }}
              />
              <Button
                color="error"
                onClick={async () => {
                  await deleteDesign(d.id);
                  setDesigns(designs.filter((x) => x.id !== d.id));
                }}
              >
                Delete
              </Button>
            </ListItem>
          ))}
        </List>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
          <Button onClick={() => setShowLoad(false)}>Close</Button>
        </Box>
      </Dialog>
    </Box>
  );
}

