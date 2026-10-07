import { chromium } from 'playwright-core';

const BASE = 'http://localhost:5000';
const results = [];
let failed = false;
const pageErrors = [];

function check(name, ok, detail = '') {
  results.push({ name, ok });
  if (!ok) failed = true;
  console.log(`  ${ok ? 'PASS' : 'FAIL'} — ${name}${detail ? ` (${detail})` : ''}`);
}

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on('pageerror', (err) => pageErrors.push(String(err)));

try {
  console.log('> produção: home + widgets');
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.locator('[data-mfe-widget="catalog/ProductGrid"]').waitFor({ timeout: 30000 });
  check('home renderiza (build de produção)', true);

  const cssOk = await page.evaluate(() => {
    let rules = 0;
    for (const sheet of document.styleSheets) {
      try {
        rules += sheet.cssRules.length;
      } catch {
        /* cross-origin */
      }
    }
    return rules;
  });
  check('folhas de estilo carregadas', cssOk > 10, `${cssOk} regras (same-origin; remotes cross-origin não contam)`);

  console.log('> produção: catálogo com estilos');
  await page.locator('header').getByRole('link', { name: /Catálogo/ }).click();
  await page.waitForFunction(
    () => document.querySelectorAll('a[aria-label^="Ver detalhes de"]').length >= 8,
    undefined,
    { timeout: 30000 },
  );
  const styled = await page.evaluate(() => {
    const card = document.querySelector('[data-mfe-widget], a[aria-label^="Ver detalhes de"]');
    const header = document.querySelector('header');
    return {
      cardRadius: card ? getComputedStyle(card).borderRadius : null,
      headerBg: header ? getComputedStyle(header).backgroundColor : null,
      bodyFont: getComputedStyle(document.body).fontFamily,
    };
  });
  check('CSS do remote aplicado (rounded do card)', styled.cardRadius !== '0px' && styled.cardRadius !== null, `radius=${styled.cardRadius}`);
  check('CSS do shell aplicado (header)', Boolean(styled.headerBg) && !styled.headerBg.startsWith('rgba(0, 0, 0, 0)'), `bg=${styled.headerBg}`);

  console.log('> produção: add → badge → carrinho → checkout');
  await page.locator('a[aria-label^="Ver detalhes de"]').first().click();
  await page.waitForFunction(
    () => document.querySelectorAll('button[aria-label$="ao carrinho"]').length === 1,
    undefined,
    { timeout: 30000 },
  );
  await page.locator('button[aria-label$="ao carrinho"]').click();
  await page.locator('a[aria-label="Carrinho com 1 itens"]').waitFor({ timeout: 15000 });
  check('badge atualiza (store singleton em produção)', true);
  await page.locator('a[aria-label="Carrinho com 1 itens"]').click();
  await page.getByText('Esvaziar carrinho').waitFor({ timeout: 30000 });
  check('carrinho lê store em produção', true);
  await page.getByRole('link', { name: 'Finalizar compra' }).click();
  await page.locator('input[placeholder="Ada Lovelace"]').waitFor({ timeout: 30000 });
  check('checkout monta em produção', true);
} catch (error) {
  failed = true;
  console.log('FAIL — exceção:', String(error));
} finally {
  await browser.close();
}

console.log('\n===== RESUMO PREVIEW =====');
console.log(`steps: ${results.filter((r) => r.ok).length}/${results.length} ok`);
console.log(`pageerrors: ${pageErrors.length}`);
pageErrors.forEach((e) => console.log(`  ! ${e}`));
if (pageErrors.length) failed = true;
process.exit(failed ? 1 : 0);
