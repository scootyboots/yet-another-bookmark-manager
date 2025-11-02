import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '../main/App'

const rootEl = document.getElementById('root')
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl)
  root.render(
    <React.StrictMode>
      <App page="new-tab" />
    </React.StrictMode>
  )
}
