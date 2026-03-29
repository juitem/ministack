import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

console.log("Vite App Mounting...");
if (typeof window !== 'undefined') {
  // Simple check to see if JS is running at all
  document.title = "TeamBuilder | Mounting...";
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
