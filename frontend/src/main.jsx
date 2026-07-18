import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { InclusiveModeProvider } from './hooks/useInclusiveMode'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <InclusiveModeProvider>
      <App />
    </InclusiveModeProvider>
  </React.StrictMode>,
)

// Register self-healing service worker (Step F41 Offline capabilities) with active cache eviction
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    caches.keys().then((names) => {
      for (let name of names) {
        caches.delete(name);
      }
    });

    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (let registration of registrations) {
        registration.update();
      }
    });

    navigator.serviceWorker.register('/sw.js')
      .then((reg) => console.log('StadiumOS ServiceWorker registered successfully: ', reg.scope))
      .catch((err) => console.error('StadiumOS ServiceWorker registration failed: ', err));
  });
}
