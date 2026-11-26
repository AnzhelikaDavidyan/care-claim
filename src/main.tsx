import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

/** In development, the mock API answers /api/* requests before the app renders. */
async function enableMocking() {
  if (!import.meta.env.DEV) return
  const { worker } = await import('./mocks/browser')
  try {
    await worker.start({ onUnhandledFrame: 'bypass' })
  } catch (error) {
    // Some embedded browsers block service workers. Render anyway; /api calls will fail visibly.
    console.warn('[CareClaim] Mock API could not start, /api requests will not be mocked.', error)
  }
}

void enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
