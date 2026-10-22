const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_EXECUTABLE,headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1200,height:1000}});
  await page.route('https://**/*',route=>route.abort());
  const expected=['/images/home.jpg','/images/cottage.jpg','/images/studio-v2.jpg','/images/office.jpg','/images/site-office-v2.jpg'];
  for(const route of ['/','/designs']){
   await page.goto('http://localhost:3000'+route,{waitUntil:'networkidle'});
   const gallery=page.locator(route==='/'?'#comp-mpwbrje2':'#design-grid');
   for(const image of await gallery.locator('img').all())await image.scrollIntoViewIfNeeded();
   await page.waitForFunction(selector=>[...document.querySelectorAll(selector+' img')].every(image=>image.complete&&image.naturalWidth>0),route==='/'?'#comp-mpwbrje2':'#design-grid');
   assert.deepEqual(await gallery.locator('img').evaluateAll(images=>images.map(image=>image.getAttribute('src'))),expected);
   await gallery.screenshot({path:'test-results/gallery-'+(route==='/'?'home':'designs')+'.png'});
  }
  await page.getByRole('tab',{name:'Studios',exact:true}).click();
  await page.locator('.design-card').click();
  assert.equal(await page.locator('.dialog-image').getAttribute('src'),'/images/studio-v2.jpg');
  console.log('PASS: five distinct images load on Home and Designs; studio detail dialog uses its new image.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1)});
