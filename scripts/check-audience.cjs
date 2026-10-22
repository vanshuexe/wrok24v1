const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_EXECUTABLE,headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1200,height:900}});
  await page.route('https://**/*',route=>route.abort());
  for(const route of ['/','/who-we-serve']){
   await page.goto('http://localhost:3000'+route,{waitUntil:'networkidle'});
   const section=page.locator(route==='/'?'#comp-mhj27bss':'#who-we-serve');
   await section.scrollIntoViewIfNeeded();
   assert.deepEqual(await section.locator('h3').allTextContents(),['Farm House','Resort','Hill Cottage','Beach Villa','Glamping Resort','Holiday Home']);
   assert.equal(await section.locator('.serve-artwork').count(),6);
   await section.screenshot({path:'test-results/audience-'+(route==='/'?'home':'page')+'.png'});
   await page.setViewportSize({width:390,height:844});
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   await section.screenshot({path:'test-results/audience-'+(route==='/'?'home':'page')+'-mobile.png'});
   await page.setViewportSize({width:1200,height:900});
  }
  await page.getByRole('button',{name:'Farm House',exact:true}).click();
  await page.waitForURL('**/contact?interest=*');
  await page.waitForFunction(()=>document.querySelector('select[name=interest]')?.value==='Farm & holiday cottages');
  console.log('PASS: matching six labels and illustrations on both pages, responsive widths, and enquiry navigation.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1)});
