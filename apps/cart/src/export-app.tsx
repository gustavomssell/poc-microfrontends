import { createBridgeComponent } from '@module-federation/bridge-react/v19';
import App from './App';
// CSS via módulo exposto: o shell injeta o Tailwind compilado do cart ao montar.
import './styles.css';

export default createBridgeComponent({
  rootComponent: App,
});
