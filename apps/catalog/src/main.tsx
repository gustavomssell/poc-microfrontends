import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

/**
 * Entrada STANDALONE — só existe quando o remote roda sozinho (npm run dev
 * ou a página própria no deploy). O <BrowserRouter> vive dentro de App;
 * o basename vem do `base` do Vite (é "/" em dev, o path do deploy em
 * produção) — no modo montado quem injeta é o shell, via bridge.
 */
const rawBase = import.meta.env.BASE_URL;
const standaloneBase = rawBase.startsWith('/') ? rawBase.replace(/\/+$/, '') : '';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App basename={standaloneBase || '/'} />
  </StrictMode>,
);
