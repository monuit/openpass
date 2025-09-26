import React from 'react'
import { createRoot } from 'react-dom/client'
import { FeatherAuthProvider, SignIn, useSession } from '@openpass/sdk'

function App(){
  const { user } = useSession()
  return (
    <div>
      <h1>OpenPass Example</h1>
      <SignIn providers={["google","github"]} />
      <pre>{JSON.stringify(user,null,2)}</pre>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <FeatherAuthProvider baseUrl={import.meta.env.VITE_AUTH_URL || 'http://localhost:4000'}>
    <App />
  </FeatherAuthProvider>
)
