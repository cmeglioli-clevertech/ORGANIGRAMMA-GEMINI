import { test as base, chromium, expect } from '@playwright/test';

// Configurazione basilare per catturare 3 screenshot rappresentativi
// - Home con header e stats
// - Filtri aperti
// - Ramo espanso dell'albero

async function ensurePageReady(page: any) {
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('#root');
}

async function safeClick(page: any, selector: string) {
  try {
    await page.click(selector, { timeout: 2000 });
  } catch {}
}

async function expandFirstBranch(page: any) {
  // Cerca un bottone di expand vicino al primo nodo visibile
  const expandButtons = page.locator('button[aria-label="Expand"]');
  const count = await expandButtons.count();
  if (count > 0) {
    await expandButtons.first().click();
  }
}

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // 1) Home
  await page.goto('http://localhost:3000');
  await ensurePageReady(page);
  await page.screenshot({ path: 'screenshots/01-home.png', fullPage: true });

  // 2) Filtri aperti
  await safeClick(page, 'button:has-text("Filtri")');
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'screenshots/02-filtri-aperti.png', fullPage: true });

  // 3) Ramo espanso
  await safeClick(page, 'body'); // chiudi overlay se aperto
  await expandFirstBranch(page);
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'screenshots/03-ramo-espanso.png', fullPage: true });

  await browser.close();
})();


