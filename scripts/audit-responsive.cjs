const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('node:fs');
const routes=['/','/about-us','/designs','/contact','/faqs','/prefab-homes','/prefab-homes/sc-20x10s','/prefab-homes/sc-20x10-one','/prefab-homes/sc-20x40-two'];
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_EXECUTABLE,headless:true});
 try{
  const page=await browser.newPage({reducedMotion:'reduce'});
  await page.route('https://**/*',route=>route.abort());
  const results=[];const errors=[];page.on('pageerror',error=>errors.push(error.message));
  for(const width of [320,390,600,768,1024,1440,1920]){
   await page.setViewportSize({width,height:900});
   for(const route of routes){
    const response=await page.goto('http://localhost:3000'+route,{waitUntil:'load'});
    const result=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,headingCount:document.querySelectorAll('h1').length,smallInputs:[...document.querySelectorAll('input:not([type=checkbox]),select,textarea')].filter(el=>el.getBoundingClientRect().width>0&&el.type!=='hidden'&&Number.parseFloat(getComputedStyle(el).fontSize)<16).length,smallControls:[...document.querySelectorAll('header button,header nav a,form button[type=submit]')].filter(el=>el.getBoundingClientRect().width>0&&el.getBoundingClientRect().height<40).map(el=>({text:el.textContent.trim(),height:el.getBoundingClientRect().height})),offscreen:[...document.querySelectorAll('main h1,main h2,main form,main input,main select,main textarea,.source-design-gallery>a,.design-card')].filter(el=>{const r=el.getBoundingClientRect();return r.width>0&&(r.left<-.5||r.right>innerWidth+.5)}).map(el=>el.tagName)}));
    results.push({route,status:response.status(),...result});
    if(width===390&&['/','/contact','/designs','/faqs'].includes(route)){
     for(const image of await page.locator('main img,.reference-home img').all())await image.scrollIntoViewIfNeeded();
     await page.evaluate(()=>window.scrollTo(0,0));
     await page.screenshot({path:'test-results/responsive-'+(route==='/'?'home':route.slice(1))+'-390.png',fullPage:true});
    }
   }
  }
  fs.writeFileSync('test-results/responsive-audit.json',JSON.stringify({results,errors},null,2));
  console.log(JSON.stringify({pages:results.length,overflow:results.filter(r=>r.scrollWidth>r.width||r.offscreen.length),mobileInputIssues:results.filter(r=>r.width<=600&&r.smallInputs),smallControls:results.filter(r=>r.width<=768&&r.smallControls.length),errors},null,2));
  if(errors.length||results.some(r=>r.status!==200||r.headingCount!==1||r.scrollWidth>r.width||r.offscreen.length||(r.width<=600&&r.smallInputs)||(r.width<=768&&r.smallControls.length)))throw new Error('Responsive audit found an issue; see test-results/responsive-audit.json');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1)});
