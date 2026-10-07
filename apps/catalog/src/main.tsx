import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

/**
 * Entrada STANDALONE — só existe quando o remote roda sozinho (npm run dev).
 * O <BrowserRouter> vive dentro de App (basename padrão "/"), então o mesmo
 * componente serve os dois modos.
 */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
