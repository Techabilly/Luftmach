import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import DesignFlow from './components/DesignFlow.jsx'
import { AuthProvider } from './auth/AuthContext.jsx'
//ggggggggg
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <DesignFlow />
    </AuthProvider>
  </StrictMode>,
)
