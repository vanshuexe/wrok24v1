const fs=require('node:fs');
const assets=JSON.parse(fs.readFileSync('data/reference-assets.json','utf8'));
(async()=>{
  let downloaded=0;
  await Promise.all(assets.map(async asset=>{
    const target='public'+asset.file;
    try{const response=await fetch(asset.url,{signal:AbortSignal.timeout(12000)});if(!response.ok)throw Error('HTTP '+response.status);fs.writeFileSync(target,Buffer.from(await response.arrayBuffer()));downloaded++;}
    catch{fs.copyFileSync('public'+asset.fallback,target);}
  }));
  console.log('Downloaded original reference images: '+downloaded+'/'+assets.length+'. Remaining images use local illustrative fallbacks.');
})();
