import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import TitleBar from './TitleBar';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TitleBar />
  </StrictMode>,
);
