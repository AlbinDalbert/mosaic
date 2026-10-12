import { useState } from 'react';
import Home from './Home';
import TitleBar from './TitleBar';
import { applyTheme, loadTheme, type Theme } from './theme';

export default function App() {
  const [theme, setTheme] = useState(loadTheme);

  function changeTheme(next: Theme) {
    applyTheme(next);
    setTheme(next);
  }

  return (
    <div className="app">
      <TitleBar theme={theme} onThemeChange={changeTheme} />
      <Home />
    </div>
  );
}
