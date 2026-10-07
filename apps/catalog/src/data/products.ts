import type { Product } from '@microstore/contracts';

/**
 * Mock local de catálogo — cada remote é dono dos seus dados.
 * Em um cenário real viraria uma API; a POC evita rede para isolar o estudo
 * à arquitetura de microfrontends.
 */
export const PRODUCTS: Product[] = [
  {
    id: 'kb-aurora',
    name: 'Teclado Mecânico Aurora',
    description: 'Switch roxo, keycaps PBT, RGB por tecla e cabo USB-C trançado.',
    price: 499.9,
    category: 'Periféricos',
    emoji: '⌨️',
    hue: 260,
    stock: 12,
  },
  {
    id: 'ms-nimbus',
    name: 'Mouse Ergonômico Nimbus',
    description: '7 botões programáveis, sensor 8000 DPI e apoio para polegar.',
    price: 249.9,
    category: 'Periféricos',
    emoji: '🖱️',
    hue: 200,
    stock: 8,
  },
  {
    id: 'mn-horizon',
    name: 'Monitor Horizon 27" 4K',
    description: 'Painel IPS 144 Hz, 98% DCI-P3 e braço articulado incluso.',
    price: 1899.0,
    category: 'Displays',
    emoji: '🖥️',
    hue: 210,
    stock: 4,
  },
  {
    id: 'hp-echo',
    name: 'Headset Sem Fio Echo',
    description: 'Cancelamento ativo de ruído, 40 h de bateria e microfone removível.',
    price: 699.0,
    category: 'Áudio',
    emoji: '🎧',
    hue: 330,
    stock: 15,
  },
  {
    id: 'ch-atlas',
    name: 'Cadeira Ergonômica Atlas',
    description: 'Apoio lombar 4D, respiro em rede e apoio de cabeça ajustável.',
    price: 2499.0,
    category: 'Móveis',
    emoji: '🪑',
    hue: 150,
    stock: 3,
  },
  {
    id: 'lp-halo',
    name: 'Luminária de Mesa Halo',
    description: 'Dimmer touch, 3 temperaturas de cor e braço dobrável de metal.',
    price: 189.9,
    category: 'Iluminação',
    emoji: '💡',
    hue: 45,
    stock: 20,
  },
  {
    id: 'wc-stream',
    name: 'Webcam 4K Stream',
    description: 'Autofóoco rápido, anel de luz integrado e capa de privacidade.',
    price: 549.0,
    category: 'Vídeo',
    emoji: '📷',
    hue: 180,
    stock: 6,
  },
  {
    id: 'tb-sketch',
    name: 'Tablet Sketch 11"',
    description: 'Tela laminada 120 Hz, caneta 4096 níveis e 128 GB de armazenamento.',
    price: 1599.0,
    category: 'Mobile',
    emoji: '📱',
    hue: 15,
    stock: 5,
  },
];

export const CATEGORIES: string[] = [...new Set(PRODUCTS.map((product) => product.category))];

export function getProduct(id: string | undefined): Product | undefined {
  return PRODUCTS.find((product) => product.id === id);
}
