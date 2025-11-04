import { useState } from 'react';
import { MusicProvider } from './contexts/MusicContext';
import { ConfigBar } from './components/ConfigBar';
import { LearnMode } from './components/LearnMode';
import { BuildMode } from './components/BuildMode';
import './AppLegacy.css';

type Mode = 'learn' | 'build';

function App() {
  const [mode, setMode] = useState<Mode>('learn');

  return (
    <MusicProvider>
      <div className="app">
        <ConfigBar mode={mode} onModeChange={setMode} />
        <main className="main-content">
          {mode === 'learn' ? <LearnMode /> : <BuildMode />}
        </main>
      </div>
    </MusicProvider>
  );
}

export default App;
