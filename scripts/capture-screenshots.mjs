import { chromium } from 'playwright';

const BASE_URL = process.env.SITE_URL || 'http://localhost:3000';

async function ensurePageReady(page) {
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('#root');
}

async function safeClick(page, selector) {
  try {
    await page.click(selector, { timeout: 2000 });
  } catch {}
}

async function expandFirstBranch(page) {
  const expandButtons = page.locator('button[aria-label="Expand"]');
  const count = await expandButtons.count();
  if (count === 0) return;

  const btn = expandButtons.first();
  try {
    await btn.scrollIntoViewIfNeeded();
    const box = await btn.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    }
    await btn.click({ force: true, timeout: 2000 });
  } catch (_) {
    // Fallback: scroll all the way a bit and try DOM click
    await page.evaluate(() => window.scrollBy(0, window.innerHeight / 2));
    await page.waitForTimeout(200);
    try {
      await page.evaluate(() => {
        const el = document.querySelector('button[aria-label="Expand"]');
        if (el) (el).click();
      });
    } catch {}
  }
}

async function waitForServer(page, url, attempts = 15, delayMs = 500) {
  for (let i = 0; i < attempts; i++) {
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      return true;
    } catch (e) {
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
  return false;
}

const run = async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const ok = await waitForServer(page, BASE_URL);
  if (!ok) {
    throw new Error(`Impossibile raggiungere l'app su ${BASE_URL}`);
  }
  await ensurePageReady(page);
  
  // Nascondi il hint di navigazione per gli screenshot
  await page.evaluate(() => {
    const hint = document.querySelector('[class*="fixed top-1/2"]');
    if (hint) hint.style.display = 'none';
  });
  
  await page.screenshot({ path: 'screenshots/01-home-navigabile.png', fullPage: true });

  await safeClick(page, 'button:has-text("Filtri")');
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'screenshots/02-filtri-aperti-navigabile.png', fullPage: true });

  // Chiudi filtri e testa zoom
  await safeClick(page, 'body');
  await page.waitForTimeout(200);
  
  // Simula zoom in con il pulsante
  await safeClick(page, 'button[title="Zoom In"]');
  await page.waitForTimeout(300);
  await safeClick(page, 'button[title="Zoom In"]');
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'screenshots/03-zoom-in.png', fullPage: true });

  // Reset e espandi primo ramo
  await safeClick(page, 'button[title="Reset Vista"]');
  await page.waitForTimeout(300);
  await expandFirstBranch(page);
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'screenshots/04-ramo-espanso.png', fullPage: true });

  await browser.close();
};

run();


