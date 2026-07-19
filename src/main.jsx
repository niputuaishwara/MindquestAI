import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Registrasi Service Worker (auto-update) — disediakan oleh vite-plugin-pwa
import { registerSW } from 'virtual:pwa-register'

registerSW({
  immediate: true,
  onRegisteredSW(swUrl, registration) {
    console.log('Service Worker terdaftar:', swUrl)
  },
  onOfflineReady() {
    console.log('MindQuest siap dipakai secara offline.')
  }
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
