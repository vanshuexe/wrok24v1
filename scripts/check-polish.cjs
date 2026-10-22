const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_EXECUTABLE,headless:true});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
  await page.route('https://**/*',route=>route.abort());
  await page.goto('http://localhost:3000',{waitUntil:'networkidle'});
  await page.evaluate(()=>window.scrollTo(0,850));
  assert.ok(Math.abs(await page.locator('#SITE_HEADER').evaluate(el=>el.getBoundingClientRect().top))<2,'Home header stays visible while scrolling');
  await page.getByRole('button',{name:'Open navigation'}).click();
  assert.equal(await page.getByRole('button',{name:'Close navigation'}).getAttribute('aria-expanded'),'true');
  await page.keyboard.press('Escape');
  assert.equal(await page.getByRole('button',{name:'Open navigation'}).getAttribute('aria-expanded'),'false');
  await page.getByRole('button',{name:'Open navigation'}).click();
  await page.mouse.click(370,800);
  assert.equal(await page.getByRole('button',{name:'Open navigation'}).getAttribute('aria-expanded'),'false');
  await page.locator('form.polished-enquiry').scrollIntoViewIfNeeded();
  assert.ok(await page.locator('form.polished-enquiry').evaluate(el=>el.getBoundingClientRect().width>=innerWidth-48),'Home form uses the available phone width');
  await page.screenshot({path:'test-results/polished-home-form.png'});
  assert.equal(await page.locator('.polished-enquiry .enquiry-grid').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length),1);
  await page.locator('.source-faq-item summary').nth(1).click();
  assert.equal(await page.locator('.source-faq-item[open]').count(),1);
  assert.equal(await page.locator('.source-faq-item').nth(1).getAttribute('open'),'');
  await page.goto('http://localhost:3000/designs');
  await page.getByRole('tab',{name:'All spaces',exact:true}).focus();
  await page.keyboard.press('ArrowRight');
  assert.equal(await page.locator('.design-card').count(),1);
  await page.keyboard.press('End');
  assert.equal(await page.locator('.design-card').count(),2);
  await page.locator('.design-card').first().click();
  assert.ok(await page.locator('.dialog-close').evaluate(el=>el.getBoundingClientRect().width>=44));
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('dialog').evaluate(el=>el.open),false);
  await page.getByRole('button',{name:'Open navigation'}).click();
  await page.keyboard.press('Escape');
  assert.equal(await page.getByRole('button',{name:'Open navigation'}).getAttribute('aria-expanded'),'false');
  await page.goto('http://localhost:3000/about-us');
  await page.getByRole('link',{name:'Back to top'}).click();
  await page.waitForURL('**/about-us#main');
  for(const [width,height]of [[844,390],[1024,768],[1920,1080]]){
   await page.setViewportSize({width,height});
   for(const route of ['/','/contact','/designs','/who-we-serve']){
    await page.goto('http://localhost:3000'+route,{waitUntil:'load'});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,route+' fits '+width+'x'+height);
   }
  }
  await page.setViewportSize({width:1440,height:1000});await page.goto('http://localhost:3000');await page.screenshot({path:'test-results/polished-desktop-hero.png'});
  console.log('PASS: sticky mobile header, menu Escape/outside click, native FAQ accordion, single-column mobile form, keyboard design filters, accessible dialog close, same-page back-to-top, landscape/tablet/wide-screen layouts.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1)});
