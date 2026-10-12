import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { applyFont, loadFont } from './fonts';
import { applyTheme, loadTheme } from './theme';

// Apply the saved palette and font before the first render so they don't flash.
applyTheme(loadTheme());
applyFont(loadFont());

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
