// Imports the supplied saved page without its third-party application runtime.
const fs = require('node:fs');
const cheerio = require(process.env.CHEERIO_MODULE || 'cheerio');
const postcss = require(process.env.POSTCSS_MODULE || 'postcss');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const svgIcons = require('lucide-react');
const details = JSON.parse(fs.readFileSync('data/site-details.json','utf8'));
const icon = (name,size=26) => renderToStaticMarkup(React.createElement(svgIcons[name] || svgIcons.Ruler,{size,strokeWidth:1.5,'aria-hidden':true,focusable:false}));
const dom = cheerio.load(fs.readFileSync('index.html', 'utf8'));
const nav = [['Home','/'],['About Us','/about-us'],['Designs','/designs'],['Contact Us','/contact'],['FAQs','/faqs']];
const navigation = '<nav class="source-navigation" aria-label="Main navigation">' + nav.map(([name, href]) => '<a href="'+href+'">'+name+'</a>').join('') + '</nav>';
// Keep the seven requested topics. These are the actual saved section nodes.
for (const id of ['comp-mqw200y3','comp-ljgsdwjw','comp-mdsmg8xg','comp-mdtu2vq3','comp-mdtu3kak','comp-mmac2722']) dom('#'+id).remove();
dom('script,iframe,noscript').remove();
dom('*').each((_, node) => { for (const attribute of Object.keys(node.attribs || {})) if (/^on/i.test(attribute)) dom(node).removeAttr(attribute); });
const styles = dom('style').map((_, node) => dom(node).html()).get().join('\n');
dom('style').remove();
dom('wix-dropdown-menu').remove();
dom('#SITE_HEADER').append(navigation);
dom('#SITE_HEADER nav').attr('id','source-navigation');
dom('#comp-iujfhbo7').addClass('source-brand');
dom('#comp-iujfhbo7 img').attr({src:'/images/smart-cubes-logo.png',alt:'Smart Cubes'}).removeAttr('srcset sizes');
dom('#SITE_HEADER').append('<button class="source-menu-button" aria-label="Open navigation" aria-controls="source-navigation" aria-expanded="false"><svg class="menu-open-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg><svg class="menu-close-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>');
const heroHeading = dom('#comp-mtzsf909 h1');
heroHeading.find('span').last().text('Prefab Homes Built Around Your Life.');
dom('#comp-mtzsf909 p').find('span').last().text('Thoughtful spaces for living and working.');
dom('#comp-mtzsf909 p').css('text-align','center');
dom('#comp-mtzsf909 a').attr('href','/designs');
dom('#comp-mtzsf909').after('<div class="source-value-strip">'+[['ShieldCheck','Purpose-built steel structures'],['Factory','Factory-controlled manufacturing'],['Truck','Transportation & installation']].map(([name,text])=>'<div>'+icon(name,23)+'<span>'+text+'</span></div>').join('')+'</div>');
const intro = dom('#comp-ljgsdwjs');
intro.find('h2').html('<span style="font-family:Arial,sans-serif;font-size:24px;color:black;font-weight:bold">Purpose-built steel modular homes & cottages</span>');
intro.find('p').first().text('Smart Cubes brings design selection, manufacturing, transportation, and installation together for modern living, leisure, and work.');
// Preserve the saved form layout and connect its fields to the Next.js endpoint.
const form = dom('form').first();
form.attr('data-source-enquiry','true');
form.find('input').each((index,node) => { const names=['name','email','phone','location']; dom(node).attr({name:names[index],required:'required',maxlength:index===0?'100':index===1?'254':index===2?'20':'150'}); if(index===2)dom(node).attr({type:'tel',pattern:'[+0-9 ()-]{8,20}'}); });
form.find('textarea').attr({name:'message',maxlength:'3000'});
const choices = ['Prefab homes','Office cabins','Site offices & security cabins','SC 20x10S','SC 20x10 One','SC 20x40 Two','Help me choose'];
form.find('button').filter((_, node)=>dom(node).text().trim()==='Choose one').replaceWith('<select name="interest" aria-label="Interested in" required><option value="">Choose one</option>'+choices.map(value=>'<option>'+value+'</option>').join('')+'</select>');
form.find('[data-hook="submit-button"]').attr('type','submit');
form.find('button').filter((_,node)=>dom(node).attr('type')==='button' && !dom(node).text().trim()).remove();
form.append('<label class="source-consent"><input name="consent" type="checkbox" required> I agree to be contacted by Smart Cubes about my enquiry.</label><div class="source-form-status" role="status" aria-live="polite"></div>');
// Native controls preserve the desktop composition and reflow cleanly on phones.
form.addClass('polished-enquiry').html('<div class="enquiry-grid">'+
  '<label>Full name <span aria-hidden="true">*</span><input name="name" autocomplete="name" placeholder="Your full name" minlength="2" maxlength="100" required></label>'+
  '<label>Email address <span aria-hidden="true">*</span><input name="email" type="email" autocomplete="email" placeholder="you@example.com" maxlength="254" required></label>'+
  '<label>Phone number <span aria-hidden="true">*</span><input name="phone" type="tel" autocomplete="tel" placeholder="+91 98765 43210" pattern="[+0-9 ()-]{8,20}" maxlength="20" required></label>'+
  '<label>Interested in <span aria-hidden="true">*</span><select name="interest" required><option value="" disabled selected>Select a space</option>'+choices.map(value=>'<option>'+value+'</option>').join('')+'</select></label>'+
  '<label class="enquiry-wide">Project city and state <span aria-hidden="true">*</span><input name="location" autocomplete="address-level2" placeholder="Where are you planning to build?" minlength="2" maxlength="150" required></label>'+
  '<label class="enquiry-wide">Project details<textarea name="message" rows="4" maxlength="3000" placeholder="Share your plans, preferred size, or approximate budget"></textarea></label>'+
  '<label class="source-consent enquiry-wide"><input name="consent" type="checkbox" required><span>I agree to be contacted by Smart Cubes about my enquiry.</span></label>'+
  '<div class="enquiry-wide enquiry-actions"><button type="submit" data-hook="submit-button">Request My Quotation <span aria-hidden="true">↗</span></button><p class="enquiry-reassurance">Just a conversation. No commitments.</p></div>'+
  '<div class="source-form-status enquiry-wide" role="status" aria-live="polite"></div></div>');
// Use a native responsive section instead of the saved fixed-width Wix wrappers.
const quotationForm = form.toString();
dom('#comp-ljgsdwjr').html('<div class="quotation-layout"><div class="quotation-copy"><span class="detail-kicker">LET’S PLAN YOUR SPACE</span><h2 id="home-quotation-heading">Request a Quotation for Your Project</h2><p>Tell us what you have in mind. We’ll help you explore designs, site requirements, and your project quotation.</p><div class="quotation-note">'+icon('ClipboardList',22)+'<span>Share your preferred space, location, and size to help us understand your project.</span></div></div><div class="quotation-form-panel">'+quotationForm+'</div></div>').attr('aria-labelledby','home-quotation-heading');
dom('.source-menu-button').append('<span class="mobile-menu-label">Menu</span>');
const designData = [ ['Prefab Homes','/images/home.jpg'],['Office Cabins','/images/office.jpg'],['Site offices & security Cabins','/images/site-office-v2.jpg'] ];
const designNotes = ['Studio · 1 BHK · 2 BHK','Work areas · Electrical options','Site administration · Security'];
const specifications = '<div class="home-specifications"><div class="details-intro"><span class="detail-kicker">PLAN YOUR SPACE</span><h3>Available configurations, clearly explained.</h3></div><div class="specifications-grid">'+details.specifications.map(item=>'<article class="specification-card"><div class="specification-icon">'+icon(item.icon)+'</div><h4>'+item.title+'</h4><strong>'+item.value+'</strong><p>'+item.text+'</p></article>').join('')+'</div><p class="specification-footnote">Available sizes, layouts, features, and project inclusions are confirmed in your quotation.</p></div>';
const designTags = ['Residential','Workspace','Site & security'];
const designDescriptions = ['Studio, 1 BHK and 2 BHK homes planned for everyday comfort.','Organised workspaces with room to focus and collaborate.','Practical cabins for site administration, supervision and security.'];
const designChips = [['Studio','1 BHK','2 BHK'],['Work areas','Air-conditioning options','Interior options'],['Steel construction','Functional layouts','Installation support']];
dom('#comp-mpwbrje2').replaceWith('<div id="comp-mpwbrje2" class="source-design-gallery">'+designData.map(([name,image],index)=>'<a class="option-card" href="'+(index===0?'/prefab-homes':'/designs')+'"><div class="option-media"><img src="'+image+'" alt="Illustrative '+name.toLowerCase()+'" loading="lazy"><span class="option-tag">'+designTags[index]+'</span><span class="option-number" aria-hidden="true">0'+(index+1)+'</span></div><div class="option-body"><h3>'+name+'</h3><p class="option-desc">'+designDescriptions[index]+'</p><ul class="option-chips">'+designChips[index].map(chip=>'<li>'+chip+'</li>').join('')+'</ul><span>Explore Designs ❯</span></div></a>').join('')+'<p class="source-image-note">Architectural imagery is illustrative where original reference photographs are unavailable.</p>'+specifications+'</div>');
const aboutCopy = '<p>At Smart Cubes, we believe creating a comfortable, functional space should be a simpler and smarter experience.</p><p>We specialise in purpose-built steel modular structures designed for modern living, leisure, and work. From compact studio spaces and 1 BHK or 2 BHK prefab homes to holiday cottages, farm cottages, office cabins, and site offices, our solutions are designed around practical needs and everyday usability.</p><p>Our approach brings manufacturing, transportation, and installation together in one streamlined process. With factory-controlled manufacturing, thoughtfully planned layouts, and modern interior options, we aim to make prefab construction a practical alternative for customers looking for a well-designed space without the complexity of a conventional build.</p><p>Whether you’re planning a weekend retreat, adding accommodation to a resort, or creating a functional workspace, Smart Cubes helps you take the next step with clarity and confidence.</p>';
const about = dom('#comp-mg0qgmec');
const aboutHeading = dom('#comp-mmab9mmy').clone();
const aboutHighlights = [['ShieldCheck','Purpose-built steel structures'],['Factory','Factory-controlled manufacturing'],['Truck','Transportation & installation']];
about.html('<div class="source-about-heading"></div><div class="source-about-copy"><div class="about-layout"><figure class="about-visual"><img src="/images/studio-v2.jpg" alt="Illustrative compact steel prefab studio" loading="lazy"><span class="about-badge">Steel · Modular · Factory-built</span><figcaption><strong>Designed for living.</strong><span>Built for possibilities.</span></figcaption></figure><div class="about-text"><span class="detail-kicker">ABOUT SMART CUBES</span>'+aboutCopy+'<ul class="about-highlights">'+aboutHighlights.map(([name,text])=>'<li>'+icon(name,24)+'<span>'+text+'</span></li>').join('')+'</ul></div></div></div>');
about.find('.source-about-heading').append(aboutHeading);
about.find('.source-about-copy').append('<div class="home-process-details"><div class="details-intro"><span class="detail-kicker">HOW IT COMES TOGETHER</span><h3>From your idea to your site.</h3></div><div class="process-steps">'+details.process.map(step=>'<article><div class="process-step-top">'+icon(step.icon)+'<span>'+step.number+'</span></div><h4>'+step.title+'</h4><p>'+step.text+'</p></article>').join('')+'</div></div>');
const originalBenefits = dom('#comp-ljgsdwjv1');
const benefitCopy = details.benefits;
const benefitsHeading = dom('#comp-m9ux817f').clone();
originalBenefits.html('<div class="source-benefits-heading"></div><div class="source-benefits-grid">'+benefitCopy.map((item,index)=>'<article class="benefit-card"><div class="benefit-card-top"><span class="benefit-icon">'+icon(item.icon)+'</span><span class="benefit-number" aria-hidden="true">'+String(index+1).padStart(2,'0')+'</span></div><h3>'+item.title+'</h3><p>'+item.short+'</p></article>').join('')+'</div>');
originalBenefits.find('.source-benefits-heading').append(benefitsHeading);
const audienceSection = dom('#comp-mhj27bss');
const audiences = JSON.parse(fs.readFileSync('data/audiences.json','utf8'));
dom('#comp-mrektk5u').html('<div class="source-audience-grid">'+audiences.map(audience=>'<a href="/who-we-serve"><span class="serve-artwork '+audience.artwork+'" aria-hidden="true"></span><h3>'+audience.name+'</h3></a>').join('')+'</div>');
// Replace competitor-specific addresses, pricing, testimonials and warranty claims.
const contact = dom('#comp-m1brny7z');
const contactHeading = dom('#comp-m9uxdjq2').clone();
contact.html('<div class="source-contact-heading"></div><div class="source-contact-copy"><p>Have a project in mind? Share your intended use, installation location, preferred size, and approximate budget.</p><div class="home-project-checklist">'+details.checklist.map(item=>'<div>'+icon(item.icon,24)+'<h3>'+item.title+'</h3><p>'+item.text+'</p></div>').join('')+'</div><a href="/contact">Contact Smart Cubes ❯</a></div>');
contact.find('.source-contact-heading').append(contactHeading);
const faq = dom('#comp-mm90kg9v');
const faqHeading = faq.find('h2').first().closest('[data-testid="richTextElement"]').clone();
const faqItems = JSON.parse(fs.readFileSync('data/faqs.json','utf8').replace(/^\uFEFF/,''));
faq.html('<div class="source-faq-heading"></div><div class="source-faq-list">'+faqItems.map((item,index)=>'<details class="source-faq-item" name="home-faq"'+(index===0?' open':'')+'><summary>'+item.question+'</summary><p>'+item.answer+'</p></details>').join('')+'</div>');
faq.find('.source-faq-heading').append(faqHeading);
dom('#SITE_FOOTER').html('<div class="source-footer"><p>© '+new Date().getFullYear()+' Smart Cubes. All rights reserved.</p>'+navigation+'</div>');
dom('#SITE_FOOTER nav').attr('aria-label','Footer navigation');
dom('#SITE_HEADER nav a[href="/"]').attr('aria-current','page');
dom('a').each((_,node)=>{ const element=dom(node),href=element.attr('href')||''; if(href.includes('loomcrafts')) {let target='/designs';const text=element.text().trim().toLowerCase();if(/about/.test(text))target='/about-us';else if(/contact|presentation/.test(text))target='/contact';else if(/serve/.test(text))target='/who-we-serve';else if(!text&&element.find('img[alt="Smart Cubes"]').length)target='/';element.attr('href',target).removeAttr('target');} });
const manifest=[];
dom('img').each((_,node)=>{const element=dom(node),src=element.attr('src')||'';if(src.startsWith('http')){const base=src.split('/v1/')[0];let fallback='/images/cottage.jpg';if(/office|site/i.test(element.attr('alt')||''))fallback='/images/office.jpg';if(src.includes('c02e70'))fallback='/images/reference-hero.jpg';const file='/images/reference-'+manifest.length+(/\.png/i.test(base)?'.png':/\.webp/i.test(base)?'.webp':'.jpg');manifest.push({url:base,file,fallback});element.attr({'src':file,'data-fallback':fallback}).removeAttr('srcset sizes');}});
// Final home structure follows the current three-option brief.
dom('#comp-mhj27bss,#comp-ljgsdwjv1,#comp-ljgsdwjs,.home-specifications,.source-value-strip').remove();
dom('#comp-mg0qgmec').insertAfter('#comp-mtzsf909');
dom('#comp-mtzsgo74').before('<p class="hero-kicker">Steel modular homes &amp; workspaces</p>');
dom('#comp-mtzsf909').after('<div class="hero-highlights">'+[['ShieldCheck','Purpose-built steel structures','Strong, durable frames'],['Factory','Factory-controlled manufacturing','Quality built off-site'],['Truck','Transportation & installation','Delivered to your site']].map(([name,title,note])=>'<div>'+icon(name,26)+'<p><strong>'+title+'</strong><span>'+note+'</span></p></div>').join('')+'</div>');
dom('#comp-ljgsdwjr').insertBefore('#comp-m1brny7z');
dom('#comp-m9l4qi7x h2').first().text('Explore our options');
let markup = dom('#SITE_CONTAINER').toString();
markup = markup.replace(/Loom Crafts/gi,'Smart Cubes');
fs.writeFileSync('data/reference-home.html',markup);
fs.writeFileSync('data/reference-assets.json',JSON.stringify(manifest,null,2));
// Prefix every rule so the imported Wix CSS cannot affect separate Next pages.
const root=postcss.parse(fs.readFileSync('styles.css','utf8')+'\n'+styles);
root.walkRules(rule=>{let parent=rule.parent;while(parent){if(parent.type==='atrule'&&/keyframes$/i.test(parent.name))return;parent=parent.parent;}rule.selectors=rule.selectors.map(selector=>{let scoped=selector.replace(/:root\b|\bhtml\b|\bbody\b/g,'.reference-home');if(!scoped.includes('.reference-home'))scoped='.reference-home '+scoped;return scoped.replace(/\.reference-home\s+\.reference-home/g,'.reference-home');});});
// Saved Wix exports repeat embedded fonts; retain the last identical definition.
const fontFaces=[];root.walkAtRules('font-face',rule=>{if(rule.parent===root)fontFaces.push(rule);});
const seenFonts=new Set();
for(const rule of fontFaces.reverse()){const signature=JSON.stringify(rule.nodes.map(node=>[node.prop,node.value,node.important]));if(seenFonts.has(signature))rule.remove();else seenFonts.add(signature);}
fs.writeFileSync('public/reference-home.css',root.toString());
console.log('Imported actual source markup and CSS; retained seven requested topics and prepared '+manifest.length+' reference images.');
