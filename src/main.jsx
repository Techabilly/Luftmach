import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import DesignFlow from './components/DesignFlow.jsx'
//gg
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DesignFlow />
  </StrictMode>,
)
