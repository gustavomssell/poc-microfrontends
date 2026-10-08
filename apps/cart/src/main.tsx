import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

/**
 * Entrada STANDALONE — basename do <BrowserRouter> vem do `base` do Vite
 * ("/" em dev, o path do deploy em produção); montado no shell, o basename
 * é injetado pelo bridge.
 */
const rawBase = import.meta.env.BASE_URL;
const standaloneBase = rawBase.startsWith('/') ? rawBase.replace(/\/+$/, '') : '';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App basename={standaloneBase || '/'} />
  </StrictMode>,
);
