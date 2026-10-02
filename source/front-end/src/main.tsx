import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import './index.css'
import App from './App.tsx'
import { store } from './app/store.ts'

let plant

if (import.meta.env.VITE_PLANT) {
  plant = import.meta.env.VITE_PLANT
} else {
  throw new Error('VITE_PLANT environment variable is not defined')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)

document.title = `ePIC - ${plant}`.trim()
