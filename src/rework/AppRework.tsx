import { useState } from 'react';
import { MusicProvider } from '../contexts/MusicContext';
import { ConfigBar } from '../components/ConfigBar';
import { LearnModeRework } from './components/LearnModeRework';
import { BuildMode } from '../components/BuildMode';
import './AppRework.css';

type Mode = 'learn' | 'build';

function AppRework() {
  const [mode, setMode] = useState<Mode>('learn');

  return (
    <MusicProvider>
      <div className="app">
        <ConfigBar mode={mode} onModeChange={setMode} />
        <main className="main-content">
          {mode === 'learn' ? <LearnModeRework /> : <BuildMode />}
        </main>
      </div>
    </MusicProvider>
  );
}

export default AppRework;
