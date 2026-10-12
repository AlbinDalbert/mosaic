import { useState } from 'react';
import Editor from './Editor';
import { applyFont, loadFont, type FontId } from './fonts';
import Home from './Home';
import TitleBar from './TitleBar';
import { applyTheme, loadTheme, type Theme } from './theme';

export default function App() {
  const [theme, setTheme] = useState(loadTheme);
  const [font, setFont] = useState(loadFont);
  const [screen, setScreen] = useState<'home' | 'editor'>('home');

  function changeTheme(next: Theme) {
    applyTheme(next);
    setTheme(next);
  }

  function changeFont(next: FontId) {
    applyFont(next);
    setFont(next);
  }

  return (
    <div className="app">
      <TitleBar
        theme={theme}
        onThemeChange={changeTheme}
        font={font}
        onFontChange={changeFont}
      />
      {screen === 'home' ? <Home onWrite={() => setScreen('editor')} /> : <Editor />}
    </div>
  );
}
