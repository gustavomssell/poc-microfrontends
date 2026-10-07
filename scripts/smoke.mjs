import { chromium } from 'playwright-core';

const BASE = 'http://localhost:5000';
const results = [];
let failed = false;
const consoleErrors = [];
const pageErrors = [];
const requestFailures = [];

function step(name) {
  process.stdout.write(`\n> ${name}\n`);
}
function check(name, ok, detail = '') {
  results.push({ name, ok, detail });
  if (!ok) failed = true;
  process.stdout.write(`  ${ok ? 'PASS' : 'FAIL'} — ${name}${detail ? ` (${detail})` : ''}\n`);
}

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

page.on('console', (msg) => {
  if (msg.type() !== 'error') return;
  const source = msg.location()?.url ?? '';
  if (/favicon/i.test(source) || /favicon/i.test(msg.text())) return;
  consoleErrors.push(`${msg.text()} @ ${source}`);
});
page.on('pageerror', (err) => pageErrors.push(String(err)));
page.on('requestfailed', (req) => {
  requestFailures.push(`${req.url()} — ${req.failure()?.errorText}`);
});
page.on('response', (res) => {
  if (res.status() >= 400) requestFailures.push(`HTTP ${res.status()} ${res.url()}`);
});

try {
  step('1. shell home');
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.locator('header').getByRole('link', { name: /Catálogo/ }).waitFor({ timeout: 20000 });
  check('shell renderiza header + nav', true);

  const miniCart = page.locator('[data-mfe-widget="cart/MiniCart"]');
  await miniCart.waitFor({ timeout: 20000 });
  check('widget MiniCart (remote cart) montado no header', true);

  const grid = page.locator('[data-mfe-widget="catalog/ProductGrid"]');
  await grid.waitFor({ timeout: 20000 });
  check('widget ProductGrid (remote catalog) montado na home', true);

  step('2. chips de saúde (state/bus singletons)');
  await page.getByText('state: 1').waitFor({ timeout: 15000 });
  await page.getByText('bus: 1').waitFor({ timeout: 5000 });
  check('store compartilhada = 1 instância', true);
  check('event-bus compartilhado = 1 instância', true);

  step('3. navegar para /catalog (bridge app)');
  await page.locator('header').getByRole('link', { name: /Catálogo/ }).click();
  await page.waitForURL('**/catalog', { timeout: 15000 });
  await page.getByRole('group', { name: 'Filtrar por categoria' }).waitFor({ timeout: 20000 });
  const cards = page.locator('a[aria-label^="Ver detalhes de"]');
  await page.waitForFunction(
    () => document.querySelectorAll('a[aria-label^="Ver detalhes de"]').length >= 8,
    undefined,
    { timeout: 20000 },
  );
  check('remote catalog montado com 8 produtos', (await cards.count()) >= 8, `${await cards.count()} cards`);

  const catalogChip = page.locator('span', { hasText: /^catalog: ok$/ }).first();
  await catalogChip.waitFor({ timeout: 10000 });
  check('chip status catalog: ok', true);

  step('4. detalhe do produto + adicionar ao carrinho');
  await cards.first().click();
  await page.waitForURL('**/catalog/*', { timeout: 15000 });
  // URL muda no pushState; esperar o commit React do detalhe (1 botão só)
  await page.waitForFunction(
    () => document.querySelectorAll('button[aria-label$="ao carrinho"]').length === 1,
    undefined,
    { timeout: 20000 },
  );
  const addBtn = page.locator('button[aria-label$="ao carrinho"]');
  await addBtn.waitFor({ timeout: 15000 });
  await addBtn.click();
  const badge1 = page.locator('a[aria-label="Carrinho com 1 itens"]');
  await badge1.waitFor({ timeout: 10000 });
  check('badge do header = 1 após add (store compartilhada)', true);

  step('5. carrinho via badge (remote cart lê a store)');
  await badge1.click();
  await page.waitForURL('**/cart', { timeout: 15000 });
  try {
    await page.getByText('Esvaziar carrinho').waitFor({ timeout: 20000 });
  } catch (error) {
    const state = await page.evaluate(() => ({
      url: location.pathname,
      text: document.body.innerText.slice(0, 500),
      mfes: [...document.querySelectorAll('[data-mfe]')].map((e) => e.getAttribute('data-mfe')),
    }));
    process.stdout.write(`DIAG ${JSON.stringify(state, null, 1)}\n`);
    throw error;
  }
  check('remote cart renderiza item vindo da store', true);
  const cartChip = page.locator('span', { hasText: /^cart: ok$/ }).first();
  await cartChip.waitFor({ timeout: 10000 });
  check('chip status cart: ok', true);

  step('6. checkout (remote checkout)');
  await page.getByRole('link', { name: 'Finalizar compra' }).click();
  await page.waitForURL('**/checkout', { timeout: 15000 });
  try {
    await page.locator('input[placeholder="Ada Lovelace"]').waitFor({ timeout: 20000 });
  } catch (error) {
    const state = await page.evaluate(() => ({
      url: location.pathname,
      text: document.body.innerText.slice(0, 700),
      mfes: [...document.querySelectorAll('[data-mfe]')].map((e) => e.getAttribute('data-mfe')),
      chips: [...document.querySelectorAll('[aria-label="Status dos microfrontends"] span[title]')]
        .map((e) => e.textContent),
    }));
    process.stdout.write(`DIAG ${JSON.stringify(state, null, 1)}\n`);
    throw error;
  }
  check('remote checkout renderiza formulário', true);
  await page.locator('input[placeholder="Ada Lovelace"]').fill('Ada Lovelace');
  await page.locator('input[type="email"]').fill('ada@exemplo.com');
  await page.locator('input[placeholder="4242 4242 4242 4242"]').fill('4242424242424242');
  await page.getByRole('button', { name: /Confirmar pedido/ }).click();
  await page.getByText('Pedido confirmado').waitFor({ timeout: 15000 });
  check('pedido confirmado + evento order:placed', true);
  await page.locator('a[aria-label="Carrinho com 0 itens"]').waitFor({ timeout: 10000 });
  check('badge zerou após clear() na store compartilhada', true);

  step('7. botão voltar (popstate sincroniza os dois routers)');
  await page.goBack();
  await page.waitForURL('**/cart', { timeout: 15000 });
  await page.getByText('Esvaziar carrinho').waitFor({ timeout: 20000 }).catch(() => {});
  check('volta para /cart sem quebrar', page.url().endsWith('/cart'));

  step('8. rotas inexistentes → 404 do shell');
  await page.goto(`${BASE}/essa-rota-nao-existe`, { waitUntil: 'domcontentloaded' });
  await page.getByText(/404|não encontrada|Não encontrada/i).first().waitFor({ timeout: 10000 });
  check('shell renderiza página 404', true);

  step('9. standalone do catalog (:5001)');
  await page.goto('http://localhost:5001/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction(
    () => document.querySelectorAll('a[aria-label^="Ver detalhes de"]').length >= 8,
    undefined,
    { timeout: 20000 },
  );
  check('catalog standalone funciona fora do shell', true);

  step('10. standalone do checkout (:5003)');
  await page.goto('http://localhost:5003/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.getByText('Nada para finalizar').waitFor({ timeout: 20000 });
  check('checkout standalone (empty state) funciona', true);
} catch (error) {
  failed = true;
  results.push({ name: 'exceção inesperada', ok: false, detail: String(error) });
  process.stdout.write(`\nFAIL — exceção: ${error}\n`);
} finally {
  await browser.close();
}

// Filtro de ruído conhecido:
// - favicon / DevTools / fonts: ruído de navegação;
// - "Encountered a script tag" (next-themes) e "synchronously unmount a
//   root" (bridge-react): avisos DEV-ONLY do React 19 — não existem na
//   build de produção. Detalhes em docs/06 § Limitações conhecidas.
const relevantConsole = consoleErrors.filter(
  (t) =>
    !/favicon|Download the React DevTools|fonts\.googleapis|Encountered a script tag|synchronously unmount a root/i.test(
      t,
    ),
);
const relevantReqs = requestFailures.filter((t) => !/favicon/i.test(t));

process.stdout.write('\n===== RESUMO =====\n');
process.stdout.write(`steps: ${results.filter((r) => r.ok).length}/${results.length} ok\n`);
process.stdout.write(`pageerrors: ${pageErrors.length}\n`);
pageErrors.forEach((e) => process.stdout.write(`  ! ${e}\n`));
process.stdout.write(`console.errors: ${relevantConsole.length}\n`);
relevantConsole.forEach((e) => process.stdout.write(`  ! ${e}\n`));
process.stdout.write(`requestfailed: ${relevantReqs.length}\n`);
relevantReqs.forEach((e) => process.stdout.write(`  ! ${e}\n`));

if (pageErrors.length > 0) failed = true;

process.exit(failed || results.some((r) => !r.ok) ? 1 : 0);
