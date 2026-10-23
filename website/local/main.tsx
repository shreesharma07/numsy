import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { LocalApp } from '../src/dashboard/LocalApp';
import '../src/styles/tokens.css';
import '../src/styles/base.css';
import '../src/styles/utilities.css';

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <LocalApp />
  </StrictMode>,
);
