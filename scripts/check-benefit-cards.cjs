const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_EXECUTABLE, headless: true });
  try {
    const page = await browser.newPage({ reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('https://**/*', route => route.abort());
    for (const path of ['/', '/benefits-of-prefab']) {
      for (const width of [320, 390, 768, 1024, 1440]) {
        await page.setViewportSize({ width, height: 1000 });
        await page.goto('http://localhost:3000' + path, { waitUntil: 'networkidle' });
        const cards = page.locator('.benefit-card');
        assert.equal(await cards.count(), 8);
        assert.deepEqual(await cards.locator('.benefit-number').allTextContents(), ['01', '02', '03', '04', '05', '06', '07', '08']);
        assert.equal(await cards.locator('.benefit-icon svg').count(), 8);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
        const fits = await cards.evaluateAll(nodes => nodes.every(card => {
          const bounds = card.getBoundingClientRect();
          return [...card.querySelectorAll('h3,p,svg,.benefit-number')].every(child => {
            const box = child.getBoundingClientRect();
            return box.left >= bounds.left && box.right <= bounds.right + 1 && box.bottom <= bounds.bottom;
          });
        }));
        assert.ok(fits, `${path} at ${width}: card content must fit`);
        if (width === 1440 || width === 390) {
          const grid = page.locator(path === '/' ? '.source-benefits-grid' : '.benefits-grid');
          await grid.screenshot({ path: `test-results/benefit-cards-${path === '/' ? 'home' : 'page'}-${width}.png` });
        }
      }
    }
    assert.deepEqual(errors, []);
    console.log('PASS: eight numbered SVG cards on both pages; content fits and no horizontal overflow at 320, 390, 768, 1024, and 1440px.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });
