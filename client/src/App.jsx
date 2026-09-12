import { useState } from 'react'
import RolePicker from './components/RolePicker'
import BroadcasterView from './components/BroadcasterView'
import ViewerView from './components/ViewerView'
import FallbackView from './components/FallbackView'

const MODES = {
  PICKER: 'picker',
  BROADCASTER: 'broadcaster',
  VIEWER: 'viewer',
  FALLBACK: 'fallback',
}

function App() {
  const [mode, setMode] = useState(MODES.PICKER)

  return (
    <div className="min-h-screen flex flex-col items-center gap-8 p-8">
      <h1 className="text-3xl font-bold tracking-tight mt-4">
        Close<span className="text-accent">The</span>Look
      </h1>

      <div className="w-full flex-1 flex items-center justify-center pb-8">
        {mode === MODES.PICKER && <RolePicker onPick={setMode} />}
        {mode === MODES.BROADCASTER && <BroadcasterView onExit={() => setMode(MODES.PICKER)} />}
        {mode === MODES.VIEWER && <ViewerView onExit={() => setMode(MODES.PICKER)} />}
        {mode === MODES.FALLBACK && <FallbackView onExit={() => setMode(MODES.PICKER)} />}
      </div>
    </div>
  )
}

export default App
