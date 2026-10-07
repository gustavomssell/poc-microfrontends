import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { ProductListPage } from './pages/ProductListPage';

/**
 * Rotas INTERNAS do remote, relativas ao basename montado no shell
 * ("/catalog", "/catalog/:id"). O shell injeta `basename` via bridge
 * (rootComponent recebe a prop); em modo standalone a prop vem vazia
 * e o Router usa "/". Cada remote é uma árvore React isolada — por isso
 * o próprio componente precisa criar o <BrowserRouter>.
 */
export default function App({ basename }: { basename?: string }) {
  return (
    <BrowserRouter basename={basename ?? '/'}>
      <Routes>
        <Route path="/" element={<ProductListPage />} />
        <Route path=":id" element={<ProductDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}
