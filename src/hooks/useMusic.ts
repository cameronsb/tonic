import { useContext } from 'react';
import { MusicContext } from '../contexts/MusicContext';

export function useMusic() {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
}
