import React from 'react'
import ReactDOM from 'react-dom/client'
import { TrackFocusProvider } from './useTrackFocus'
import NewTab from './NewTab'
import './NewTab.css'

const rootEl = document.getElementById('root')
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl)
  root.render(
    <React.StrictMode>
      <TrackFocusProvider>
        <div className="dark-w-p bg-background text-foreground">
          <NewTab />
        </div>
      </TrackFocusProvider>
    </React.StrictMode>,
  )
}
