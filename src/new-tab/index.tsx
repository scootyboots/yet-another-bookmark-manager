import React from 'react'
import ReactDOM from 'react-dom/client'
import { TrackFocusProvider } from './useTrackFocus'
import NewTab from './NewTab'
import './NewTab.css'
import { cn } from '@/lib/utils'

const someGradient =
  'bg-[linear-gradient(233deg,rgba(20,7,14,1)_0%,rgba(38,2,24,1)_100%)]'

const rootEl = document.getElementById('root')
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl)
  root.render(
    <React.StrictMode>
      <TrackFocusProvider>
        <div className={cn('dark-w-p relative bg-background text-foreground')}>
          <NewTab />
          <div
            className={cn(
              'absolute -top-60 -left-60 w-[85vw] h-[85vh] bg-[radial-gradient(circle,rgba(47,7,29,1)_8%,rgba(0,0,0,0)_35%)]',
            )}
          />
        </div>
      </TrackFocusProvider>
    </React.StrictMode>,
  )
}
