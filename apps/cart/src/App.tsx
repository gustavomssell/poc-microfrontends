import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { CartPage } from './pages/CartPage';

export default function App({ basename }: { basename?: string }) {
  return (
    <BrowserRouter basename={basename ?? '/'}>
      <Routes>
        <Route path="/" element={<CartPage />} />
      </Routes>
    </BrowserRouter>
  );
}
