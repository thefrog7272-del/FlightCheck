import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Amplify } from 'aws-amplify'
import outputs from '../amplify_outputs.json'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './contexts/AuthContext'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const config = outputs as any;
// Ensure guest access is enabled for unauthenticated API calls
if (config.auth) {
  config.auth.unauthenticated_identities_enabled = true;
}
Amplify.configure(config)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
