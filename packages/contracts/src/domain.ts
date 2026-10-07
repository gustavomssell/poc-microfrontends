export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  emoji: string;
  /** Matiz usada para gerar o gradiente do card (placeholder visual sem imagens). */
  hue: number;
  stock: number;
}

export interface CartItem {
  product: Product;
  qty: number;
}

export interface OrderCustomer {
  name: string;
  email: string;
  card: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  customer: OrderCustomer;
  placedAt: string;
}
