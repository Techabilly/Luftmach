import React, { useState } from 'react';
import { useAuth } from './AuthContext.jsx';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  TextField,
  Button,
  Alert,
  Box,
} from '@mui/material';

export default function AuthModal({ open, onClose }) {
  const { signInWithEmail, signUpWithEmail, signInWithOAuth } = useAuth();
  const [tab, setTab] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const fn = tab === 'signin' ? signInWithEmail : signUpWithEmail;
    const { error } = await fn(email, password);
    if (error) setError(error.message);
    else onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>{tab === 'signin' ? 'Sign In' : 'Create Account'}</DialogTitle>
      <DialogContent>
        <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab value="signin" label="Sign In" />
          <Tab value="signup" label="Create Account" />
        </Tabs>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <TextField
            type="email"
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            type="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <Alert severity="error">{error}</Alert>}
          <Button type="submit" variant="contained">
            {tab === 'signin' ? 'Sign In' : 'Sign Up'}
          </Button>
        </Box>
        <Box sx={{ my: 2, textAlign: 'center' }}>or</Box>
        <Button
          variant="outlined"
          fullWidth
          sx={{ mb: 1 }}
          onClick={() => signInWithOAuth('github')}
        >
          Sign in with GitHub
        </Button>
        <Button
          variant="outlined"
          fullWidth
          onClick={() => signInWithOAuth('google')}
        >
          Sign in with Google
        </Button>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
