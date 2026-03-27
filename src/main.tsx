import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Amplify, type ResourcesConfig } from 'aws-amplify'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './contexts/AuthContext'

const amplifyConfig: ResourcesConfig = {
  Auth: {
    Cognito: {
      userPoolId: 'eu-west-2_PiGk2P7Pg',
      userPoolClientId: '532t6gkr3prdh5qrnjn4j1a2j3',
      identityPoolId: 'eu-west-2:63049872-be5a-40a7-8a32-9f86ad24c5a5',
      allowGuestAccess: true,
    },
  },
  API: {
    GraphQL: {
      endpoint: 'https://ep3mvuopvbh6rbznjkguq7i5b4.appsync-api.eu-west-2.amazonaws.com/graphql',
      region: 'eu-west-2',
      defaultAuthMode: 'iam',
    },
  },
};

Amplify.configure(amplifyConfig)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
