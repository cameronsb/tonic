import { MusicProvider } from '../contexts/MusicContext';
import { ConfigBar } from '../components/ConfigBar';
import { LearnModeRework } from './components/LearnModeRework';
import './AppRework.css';

function AppRework() {
  return (
    <MusicProvider>
      <div className="app">
        <ConfigBar />
        <main className="main-content">
          <LearnModeRework />
        </main>
      </div>
    </MusicProvider>
  );
}

export default AppRework;
