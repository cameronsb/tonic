import { useMemo } from 'react';
import AppLegacy from './AppLegacy';
import AppRework from './rework/AppRework';

function App() {
  const isLegacy = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('legacy') === 'true';
  }, []);

  if (isLegacy) {
    return <AppLegacy />;
  }

  return <AppRework />;
}

export default App;
