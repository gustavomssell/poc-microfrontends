import { chromium } from 'playwright-core';

const BASE = 'http://localhost:5000';
let failed = false;
const pageErrors = [];

function check(name, ok, detail = '') {
  if (!ok) failed = true;
  console.log(`  ${ok ? 'PASS' : 'FAIL'} — ${name}${detail ? ` (${detail})` : ''}`);
}

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on('pageerror', (err) => pageErrors.push(String(err)));

try {
  console.log('> shell com o remote cart FORA do ar');
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 30000 });

  await page.locator('header').getByRole('link', { name: /Catálogo/ }).waitFor({ timeout: 30000 });
  check('shell renderiza (não depende do cart)', true);

  // fallback do badge: StoreBadge lê a store do shell
  await page.locator('[title*="Fallback do shell"]').waitFor({ timeout: 30000 });
  check('MiniCart degrada para StoreBadge (fallback local)', true);

  await page.getByText(/^cart: erro$/).waitFor({ timeout: 30000 });
  check('chip de status mostra cart: erro', true);

  await page.locator('[data-mfe-widget="catalog/ProductGrid"]').waitFor({ timeout: 30000 });
  check('widget do catálogo segue funcionando', true);

  console.log('> catálogo segue navegável');
  await page.locator('header').getByRole('link', { name: /Catálogo/ }).click();
  await page.waitForFunction(
    () => document.querySelectorAll('a[aria-label^="Ver detalhes de"]').length >= 8,
    undefined,
    { timeout: 30000 },
  );
  check('rota /catalog monta com cart caído', true);

  await page.locator('a[aria-label^="Ver detalhes de"]').first().click();
  await page.waitForFunction(
    () => document.querySelectorAll('button[aria-label$="ao carrinho"]').length === 1,
    undefined,
    { timeout: 30000 },
  );
  check('detalhe do produto monta com cart caído', true);

  // badge fallback ainda reflete a store (mesmo estado compartilhado)
  await page.locator('button[aria-label$="ao carrinho"]').click();
  await page.locator('[title*="Fallback do shell"]').waitFor({ timeout: 15000 });
  const badgeText = await page.locator('[title*="Fallback do shell"]').innerText();
  check('fallback do badge atualiza com a store', /1/.test(badgeText), `texto="${badgeText.replace(/\s+/g, ' ')}"`);

  console.log('> rota /cart com remote caído');
  await page.goto(`${BASE}/cart`, { waitUntil: 'domcontentloaded' });
  await page.getByText(/cart: erro|Carrinho/).first().waitFor({ timeout: 30000 });
  check('shell não quebra em /cart (fallback no slot)', true);
} catch (error) {
  failed = true;
  console.log('FAIL — exceção:', String(error));
} finally {
  await browser.close();
}

console.log('\n===== RESUMO RESILIÊNCIA =====');
console.log(`pageerrors: ${pageErrors.length}`);
pageErrors.forEach((e) => console.log(`  ! ${e}`));
// erro de rede esperado (remote caído) pode vazar como pageerror de import dinâmico
const ignorable = pageErrors.every((e) => /Failed to fetch|Importing a module script failed|error loading dynamically imported module/i.test(e));
if (pageErrors.length && !ignorable) failed = true;
process.exit(failed ? 1 : 0);
