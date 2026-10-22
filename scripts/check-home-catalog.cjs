const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const models = [['sc-20x10s', 'SC 20x10S'], ['sc-20x10-one', 'SC 20x10 One'], ['sc-20x40-two', 'SC 20x40 Two']];
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_EXECUTABLE, headless: true });
  try {
    const page = await browser.newPage({ reducedMotion: 'reduce' });
    await page.route('https://**/*', route => route.abort());
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    await page.goto('http://localhost:3000');
    assert.equal(await page.locator('.source-design-gallery>a').count(), 3);
    assert.equal(await page.getByRole('heading', { name: 'Explore our options', exact: true }).count(), 1);
    assert.equal(await page.locator('.home-specifications,#comp-mhj27bss,#comp-ljgsdwjv1').count(), 0);
    assert.equal(await page.locator('a[href="/who-we-serve"],a[href="/benefits-of-prefab"]').count(), 0);
    const order = await page.evaluate(() => ['comp-mtzsf909', 'comp-mg0qgmec', 'comp-m9l4qi7x', 'comp-ljgsdwjr', 'comp-m1brny7z'].map(id => document.getElementById(id).getBoundingClientRect().top));
    assert.ok(order.every((top, index) => !index || top > order[index - 1]), 'Home section order');
    assert.ok(await page.locator('#comp-ljgsdwjr').evaluate(el => el.nextElementSibling?.id === 'comp-m1brny7z'), 'Quotation immediately before Contact');
    await page.locator('.source-design-gallery>a').first().click(); await page.waitForURL('**/prefab-homes');
    assert.equal(await page.locator('.catalog-section').count(), 3);
    assert.deepEqual(await page.locator('.catalog-section h2').allTextContents(), ['Studio', '1 BHK', '2 BHK']);
    assert.deepEqual(await page.locator('.home-model-card h3').allTextContents(), models.map(([, name]) => name));
    assert.equal(await page.getByRole('link', { name: 'Enquire prices', exact: true }).count(), 3);
    for (const [slug, name] of models) {
      await page.goto(`http://localhost:3000/prefab-homes/${slug}`);
      assert.equal(await page.locator('h1').textContent(), name);
      assert.doesNotMatch(await page.locator('main').innerText(), /₹|Rs\.|\bINR\b|\$\d/);
      await page.getByRole('button', { name: 'Next image', exact: true }).click();
      assert.equal(await page.locator('.product-gallery-controls span').textContent(), '2 / 4');
      await page.getByRole('button', { name: 'Show image 4', exact: true }).click();
      assert.equal(await page.locator('.product-gallery-controls span').textContent(), '4 / 4');
      await page.getByRole('link', { name: 'Enquire now', exact: true }).click();
      await page.waitForURL('**/contact?interest=*');
      await page.waitForFunction(value => document.querySelector('select[name=interest]')?.value === value, name);
      assert.equal(await page.locator('select[name=interest]').inputValue(), name);
    }
    await page.route('**/api/enquiries', async route => {
      const payload = route.request().postDataJSON(); assert.equal(payload.interest, 'SC 20x40 Two');
      await route.fulfill({ status: 201, contentType: 'application/json', body: '{"ok":true}' });
    });
    await page.locator('input[name=name]').fill('Preview Check'); await page.locator('input[name=email]').fill('preview@example.com'); await page.locator('input[name=phone]').fill('9876543210'); await page.locator('input[name=location]').fill('Delhi'); await page.locator('input[name=consent]').check(); await page.getByRole('button', { name: 'Request My Quotation' }).click(); await page.getByRole('heading', { name: 'Your idea is in good hands.' }).waitFor();
    await page.goto('http://localhost:3000/designs');
    for (const type of ['Office cabins', 'Site offices & security cabins']) {
      await page.getByRole('button', { name: new RegExp(type.replace('&', '\\&')) }).click();
      assert.equal(await page.locator('dialog').evaluate(el => el.open), true);
      await page.getByRole('button', { name: 'Close design details' }).click();
    }
    for (const path of ['/who-we-serve', '/benefits-of-prefab', '/prefab-homes/not-a-model']) assert.equal((await page.goto('http://localhost:3000' + path)).status(), 404);
    const routes = ['/', '/about-us', '/designs', '/contact', '/faqs', '/prefab-homes', ...models.map(([slug]) => '/prefab-homes/' + slug)];
    for (const width of [320, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const path of routes) {
        const response = await page.goto('http://localhost:3000' + path, { waitUntil: 'load' });
        assert.equal(response.status(), 200); assert.equal(await page.locator('h1').count(), 1);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, path + ' fits at ' + width);
        assert.ok(await page.locator('main h1, main h2, main h3, main p, main form, .home-model-card, .product-thumbnails').evaluateAll(nodes => nodes.every(el => { const r = el.getBoundingClientRect(); return !r.width || (r.left >= -1 && r.right <= innerWidth + 1); })), path + ' text fits at ' + width);
        if ([390, 1440].includes(width) && ['/', '/prefab-homes', '/prefab-homes/sc-20x10s'].includes(path)) {
          for (const image of await page.locator('main img,.reference-home main img').all()) { await image.scrollIntoViewIfNeeded(); await image.evaluate(el => el.decode().catch(() => {})); }
          await page.evaluate(() => scrollTo(0,0));
          await page.screenshot({ path: `test-results/catalog-${path === '/' ? 'home' : path.replaceAll('/', '-')}-${width}.png`, fullPage: true });
        }
      }
    }
    await page.setViewportSize({ width: 390, height: 844 }); await page.goto('http://localhost:3000/prefab-homes'); await page.getByRole('button', { name: 'Open navigation' }).click(); assert.equal(await page.locator('.mobile-nav a').count(), 5); await page.keyboard.press('Escape');
    assert.deepEqual(errors, []);
    console.log('PASS: Home order and removals; three categories and products; gallery controls; model-specific enquiry payload; unchanged office dialogs; removed routes return 404; 45 responsive route/width checks and mobile navigation.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });
