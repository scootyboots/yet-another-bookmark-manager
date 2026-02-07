import NewTab from '../new-tab/NewTab'
import { TrackFocusProvider } from '../new-tab/useTrackFocus'
import './App.css'

const App = ({ page }: { page: 'new-tab' | 'other' }) => {
  if (page === 'new-tab') {
    return (
      <TrackFocusProvider>
        <NewTab />
      </TrackFocusProvider>
    )
  }
  return (
    <div className="content">
      <h1>Rsbuild with React</h1>
      <p>Start building amazing things with Rsbuild.</p>
      <p>even more amazing things</p>
    </div>
  )
}

export default App
