import { chromium } from 'playwright-core';

const BASE = 'http://localhost:5000';
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});

async function shot(name) {
  await page.waitForTimeout(700);
  await page.screenshot({ path: `docs/screenshots/${name}.png` });
  console.log('shot:', name);
}

await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 30000 });
await page.locator('[data-mfe-widget="catalog/ProductGrid"]').waitFor({ timeout: 30000 });
await page.getByText('state: 1').waitFor({ timeout: 15000 });
await shot('01-home');

await page.locator('header').getByRole('link', { name: /Catálogo/ }).click();
await page.waitForFunction(
  () => document.querySelectorAll('a[aria-label^="Ver detalhes de"]').length >= 8,
  undefined,
  { timeout: 30000 },
);
await shot('02-catalogo');

await page.locator('a[aria-label^="Ver detalhes de"]').first().click();
await page.waitForFunction(
  () => document.querySelectorAll('button[aria-label$="ao carrinho"]').length === 1,
  undefined,
  { timeout: 30000 },
);
await shot('03-produto');

await page.locator('button[aria-label$="ao carrinho"]').click();
await page.locator('a[aria-label="Carrinho com 1 itens"]').waitFor({ timeout: 15000 });
await page.locator('a[aria-label="Carrinho com 1 itens"]').click();
await page.getByText('Esvaziar carrinho').waitFor({ timeout: 30000 });
await shot('04-carrinho');

await page.getByRole('link', { name: 'Finalizar compra' }).click();
await page.locator('input[placeholder="Ada Lovelace"]').waitFor({ timeout: 30000 });
await page.locator('input[placeholder="Ada Lovelace"]').fill('Ada Lovelace');
await page.locator('input[type="email"]').fill('ada@exemplo.com');
await page.locator('input[placeholder="4242 4242 4242 4242"]').fill('4242424242424242');
await shot('05-checkout');

await page.getByRole('button', { name: /Confirmar pedido/ }).click();
await page.getByText('Pedido confirmado').waitFor({ timeout: 15000 });
await shot('06-pedido-confirmado');

await browser.close();
console.log('ok');
