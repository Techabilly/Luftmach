import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import DesignFlow from './components/DesignFlow.jsx'
//gggg
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DesignFlow />
  </StrictMode>,
)
