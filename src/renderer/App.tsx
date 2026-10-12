import { useState } from 'react';
import Editor from './Editor';
import Home from './Home';
import TitleBar from './TitleBar';
import { applyTheme, loadTheme, type Theme } from './theme';

export default function App() {
  const [theme, setTheme] = useState(loadTheme);
  const [screen, setScreen] = useState<'home' | 'editor'>('home');

  function changeTheme(next: Theme) {
    applyTheme(next);
    setTheme(next);
  }

  return (
    <div className="app">
      <TitleBar theme={theme} onThemeChange={changeTheme} />
      {screen === 'home' ? <Home onWrite={() => setScreen('editor')} /> : <Editor />}
    </div>
  );
}
