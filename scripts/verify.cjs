const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const routes = [['/', 'home'], ['/about-us', 'about'], ['/designs', 'designs'], ['/who-we-serve', 'who-we-serve'], ['/benefits-of-prefab', 'benefits'], ['/contact', 'contact'], ['/faqs', 'faqs']];

(async () => {
  const browser = await chromium.launch({ ...(process.env.CHROME_EXECUTABLE ? { executablePath: process.env.CHROME_EXECUTABLE } : {}), headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const [route, section] of routes) {
      const response = await page.goto('http://localhost:3000' + route, { waitUntil: 'networkidle' });
      assert.equal(response.status(), 200, route + ' loads directly');
      if (route === '/') {
        assert.equal(await page.locator('.reference-home').count(), 1, 'Home imports the supplied HTML');
        for (const id of ['comp-mtzsf909','comp-ljgsdwjr','comp-m9l4qi7x','comp-mhj27bss','comp-ljgsdwjv1','comp-m1brny7z','comp-mg0qgmec','comp-mm90kg9v']) assert.equal(await page.locator('#' + id).count(), 1);
      } else {
        assert.equal(await page.locator('main > section').count(), 1, route + ' has its own section only');
        assert.equal(await page.locator('main > section').getAttribute('id'), section);
      }
      assert.equal(await page.locator('h1').count(), 1, route + ' has one main heading');
      assert.equal(await page.locator(route === '/' ? '#SITE_HEADER [aria-current="page"]' : '.desktop-nav [aria-current="page"]').getAttribute('href'), route);
      assert.match(await page.title(), /Smart Cubes/);
      for (const image of await page.locator('main img').all()) await image.scrollIntoViewIfNeeded();
      await page.waitForFunction(() => [...document.images].every(image => image.complete && image.naturalWidth > 0));
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    }
    await page.goto('http://localhost:3000');
    assert.equal(await page.locator('#SITE_HEADER nav a').count(), 7);
    await page.getByRole('navigation', { name: 'Main navigation', exact: true }).getByRole('link', { name: 'About Us', exact: true }).click();
    await page.waitForURL('**/about-us');
    await page.getByRole('heading', { name: 'About Us', exact: true }).waitFor();
    await page.screenshot({ path: 'test-results/about-desktop.png', fullPage: true });
    await page.getByRole('navigation', { name: 'Main navigation', exact: true }).getByRole('link', { name: 'Designs', exact: true }).click();
    await page.waitForURL('**/designs');
    assert.equal(await page.locator('.design-card').count(), 5);
    await page.getByRole('tab', { name: 'Workspaces' }).click();
    assert.equal(await page.locator('.design-card').count(), 2);
    await page.locator('.design-card').first().click();
    assert.equal(await page.locator('dialog').evaluate(element => element.open), true);
    await page.getByRole('button', { name: 'Enquire about this space' }).click();
    await page.waitForURL('**/contact?interest=*');
    await page.waitForFunction(() => document.querySelector('select[name="interest"]')?.value === 'Office cabins');
    await page.reload();
    await page.waitForFunction(() => document.querySelector('select[name="interest"]')?.value === 'Office cabins');
    const invalid = await page.request.post('http://localhost:3000/api/enquiries', { data: { name: 'A' } });
    assert.equal(invalid.status(), 400);
    const file = path.join(process.cwd(), 'data/enquiries.jsonl');
    const testEmail = 'routing-check-' + Date.now() + '@example.com';
    await page.locator('[name="name"]').fill('Website routing verification');
    await page.locator('[name="phone"]').fill('+91 98765 43210');
    await page.locator('[name="email"]').fill(testEmail);
    await page.locator('[name="location"]').fill('Bengaluru');
    await page.locator('[name="message"]').fill('Automated verification; not a customer enquiry.');
    await page.locator('[name="consent"]').check();
    try {
      await page.getByRole('button', { name: 'Request My Quotation' }).click();
      await page.getByRole('heading', { name: 'Your idea is in good hands.' }).waitFor();
      assert.match(fs.readFileSync(file, 'utf8'), new RegExp(testEmail));
    } finally {
      if (fs.existsSync(file)) {
        const retained = fs.readFileSync(file, 'utf8').split('\n').filter(line => line && JSON.parse(line).email !== testEmail);
        fs.writeFileSync(file, retained.length ? retained.join('\n') + '\n' : '');
      }
    }
    await page.goto('http://localhost:3000/faqs');
    await page.getByRole('button', { name: 'View all 15 questions' }).click();
    assert.equal(await page.locator('.faq-item').count(), 15);
    await page.getByRole('button', { name: /Do I need permission/ }).click();
    assert.equal(await page.locator('#faq-answer-13').isVisible(), true);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole('button', { name: 'Open navigation' }).click();
    await page.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('link', { name: 'About Us', exact: true }).click();
    await page.waitForURL('**/about-us');
    assert.equal(await page.getByRole('button', { name: 'Open navigation' }).getAttribute('aria-expanded'), 'false');
    await page.screenshot({ path: 'test-results/about-mobile.png', fullPage: true });
    for (const width of [390, 768, 1024]) {
      await page.setViewportSize({ width, height: 844 });
      for (const [route] of routes) {
        await page.goto('http://localhost:3000' + route);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `No overflow: ${route} at ${width}px`);
      }
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto('http://localhost:3000');
    for (const image of await page.locator('main img').all()) await image.scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: 'test-results/desktop.png', fullPage: true });
    assert.deepEqual(errors, []);
    console.log('PASS: seven independent routes, direct loads, page headings and metadata, active navigation, desktop/mobile links, design enquiry with reload-safe prefilling, form persistence, all FAQs, loaded images, responsive widths, and no browser errors.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });
