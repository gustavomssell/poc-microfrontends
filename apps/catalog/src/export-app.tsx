import { createBridgeComponent } from '@module-federation/bridge-react/v19';
import App from './App';
// CSS via módulo exposto: quando o shell monta este remote, o Tailwind
// compilado do catalog é injetado junto (o main.tsx standalone não carrega).
import './styles.css';

/**
 * Ponto de exposição "aplicação completa": o bridge cuida de ciclo de vida,
 * basename e isolamento de contexto quando o shell monta este remote.
 */
export default createBridgeComponent({
  rootComponent: App,
});
