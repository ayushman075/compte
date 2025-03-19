import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ClerkProvider } from '@clerk/clerk-react'


const PUBLISHABLE_KEY = import.meta.env.CLERK_PUBLISHABLE_KEY||"pk_test_Y29zbWljLWZpcmVmbHktMTEuY2xlcmsuYWNjb3VudHMuZGV2JA"
console.log(import.meta.env.CLERK_PUBLISHABLE_KEY)
if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/login">
    <App />
    </ClerkProvider>

  </StrictMode>,
)
