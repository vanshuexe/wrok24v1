const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_EXECUTABLE,headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
 await page.route('https://**/*',route=>route.abort());
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('http://localhost:3000',{waitUntil:'networkidle'});
 for(const image of await page.locator('img').all())await image.scrollIntoViewIfNeeded();
 await page.waitForFunction(()=>[...document.images].every(image=>image.complete&&image.naturalWidth>0));
 await page.evaluate(()=>window.scrollTo(0,0));
 await page.screenshot({path:'test-results/imported-desktop.png',fullPage:true});
 await page.screenshot({path:'test-results/imported-hero.png'});
 console.log('Desktop',await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight,heading:document.querySelector('h1')?.textContent,claims:document.body.innerText.match(/Loom|600\+|20-Year|₹|844844|987112|loomcrafts/gi)})));
 console.log('Audience images',await page.locator('.source-audience-grid img').evaluateAll(nodes=>nodes.map(el=>({src:el.getAttribute('src'),complete:el.complete,naturalWidth:el.naturalWidth,visibility:getComputedStyle(el).visibility,opacity:getComputedStyle(el).opacity,display:getComputedStyle(el).display,rect:{width:el.getBoundingClientRect().width,height:el.getBoundingClientRect().height},parent:getComputedStyle(el.parentElement).opacity}))));
 const testEmail='source-form-'+Date.now()+'@example.com';
 const form=page.locator('[data-source-enquiry]');
 await form.locator('[name=name]').fill('Source form verification');
 await form.locator('[name=email]').fill(testEmail);
 await form.locator('[name=phone]').fill('+91 98765 43210');
 await form.locator('[name=location]').fill('Bengaluru');
 await form.locator('[name=interest]').selectOption('Prefab homes');
 await form.locator('[name=consent]').check();
 try{await form.locator('[type=submit]').click();await page.waitForFunction(()=>document.querySelector('.source-form-status')?.textContent.includes('Your enquiry has been saved'));console.log('PASS: imported home quotation form saves enquiries.');}
 finally{const file='data/enquiries.jsonl';if(fs.existsSync(file)){const rows=fs.readFileSync(file,'utf8').split('\n').filter(line=>line&&JSON.parse(line).email!==testEmail);fs.writeFileSync(file,rows.length?rows.join('\n')+'\n':'');}}
 for(const width of [390,768]){await page.setViewportSize({width,height:844});await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:'test-results/imported-'+width+'.png',fullPage:true});console.log('Mobile',width,await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight})));}
 await page.setViewportSize({width:390,height:844});await page.getByRole('button',{name:'Open navigation'}).click();await page.locator('#SITE_HEADER nav').getByRole('link',{name:'About Us',exact:true}).click();await page.waitForURL('**/about-us');console.log('PASS: imported home mobile menu navigates to separate pages.');
 console.log('Errors',errors);
 await browser.close();
})().catch(error=>{console.error(error);process.exit(1)});
