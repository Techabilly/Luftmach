import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import DesignFlow from './components/DesignFlow.jsx'
import { AuthProvider } from './auth/AuthContext.jsx'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'

const theme = createTheme()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <DesignFlow />
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)
