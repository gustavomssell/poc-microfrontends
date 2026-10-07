import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { CheckoutPage } from './pages/CheckoutPage';

export default function App({ basename }: { basename?: string }) {
  return (
    <BrowserRouter basename={basename ?? '/'}>
      <Routes>
        <Route path="/" element={<CheckoutPage />} />
      </Routes>
    </BrowserRouter>
  );
}
