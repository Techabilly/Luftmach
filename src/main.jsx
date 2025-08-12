import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import DesignFlow from './components/DesignFlow.jsx'
import { AuthProvider } from './auth/AuthContext.jsx'
import { UiProvider } from './ui/UiContext.jsx'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
//gg
const theme = createTheme()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <UiProvider>
          <DesignFlow />
        </UiProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)
