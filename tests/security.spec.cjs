const{test,expect}=require('@playwright/test');
const fs=require('node:fs');
const PASS='Panklaar-testwachtwoord-2026';
async function unlock(page,existing=false){if(!existing)await page.goto('/');await expect(page.locator('#wachtwoordDialoog')).toBeVisible();await page.locator('#wachtwoordDialoog').waitFor({state:'visible'});if(await page.locator('#gebruikersnaamBlok').isVisible())await page.locator('#gebruikersnaam').fill('testgebruiker');await page.locator('#wachtwoord').fill(PASS);if(!existing)await page.locator('#wachtwoordHerhaal').fill(PASS);await page.locator('#wachtwoordDoorgaan').click();await expect(page.locator('#wachtwoordDialoog')).not.toBeVisible();await expect(page.locator('#screen')).toContainText('Panklaar');}
async function flush(page){await page.evaluate(()=>PanklaarSecurity.flush());}
const recipe={id:'safe',name:'Veilig testrecept',type:'dinner',mins:20,serves:2,level:'easy',ingredients:['100 g rijst'],steps:['Kook de rijst 10 minuten.']};
function data(){return {recipes:[recipe],shopping:[],pantry:[],plan:{},theme:'auto',family:[{id:'family1',name:'Fictief gezinslid',stages:['none'],eat:true,allergies:['noten'],allergyText:'',note:''}],equip:[],prefs:{veg:7,fish:1,meat:3,flags:[]},timers:[],usage:{},budget:5,aiDienst:'openai',aiModellen:{}};}
async function uploadBackup(page,value){await page.evaluate(()=>{go('profile');vakOpen.backup=true;render();});await page.locator('#backup-input').setInputFiles({name:'backup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(value))});}
async function confirmImport(page){await page.locator('#menu [data-menu="1"]').click();await expect(page.locator('#toast')).toContainText('veilig teruggezet');}
test('recipe CRUD, shopping, planner and reload preserve encrypted data',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await unlock(page);
 await page.locator('[data-go="new"]').click();await page.locator('#f-name').fill('Eigen testrecept');await page.locator('#f-ing').fill('200 g pasta\n1 courgette');await page.locator('#f-steps').fill('Kook pasta 9 min.');await page.locator('[data-save]').click();await expect(page.locator('#screen')).toContainText('Eigen testrecept');
 await page.locator('[data-addlist]').click();await page.evaluate(()=>go('shopping'));await expect(page.locator('#screen')).toContainText('pasta');await flush(page);
 await page.evaluate(()=>{S.plan.Ma=S.recipes.at(-1).id;return persist();});await flush(page);await page.reload();await unlock(page,true);
 await page.evaluate(()=>go('recipes'));await expect(page.locator('#screen')).toContainText('Eigen testrecept');await page.evaluate(()=>go('plan'));await expect(page.locator('[data-plan-day="Ma"]')).toContainText('Eigen testrecept');
 const raw=await page.evaluate(()=>new Promise((resolve,reject)=>{const r=indexedDB.open('panklaar-secure',1);r.onsuccess=()=>{const q=r.result.transaction('vault').objectStore('vault').get('v1');q.onsuccess=()=>{resolve(JSON.stringify(q.result));r.result.close();};};r.onerror=()=>reject(r.error);}));expect(raw).not.toContain('Eigen testrecept');expect(raw).toContain('panklaar-vault');expect(errors).toEqual([]);
});
test('malicious photos, attributes, nested fields and pathological patterns stay inert',async({page})=>{
 await unlock(page);
 const x=await page.evaluate(r=>{
  const before=S.recipes.length;const bad=[{...r,foto:'x" onerror="window.pwned=1'},{...r,mins:'<img src=x onerror=window.pwned=1>'},{...r,ingredients:{}},{...r,id:'x" onclick="window.pwned=1'}];
  const results=bad.map(item=>{try{PanklaarSecurity.validate({...pack(),recipes:[item]});return false;}catch{return true;}});
  const candidate=showCandidates({...r,foto:'x" onerror="window.pwned=1'});
  return {results,candidate,marker:window.pwned,count:S.recipes.length,before};
 },recipe);
 expect(x.results.every(Boolean)).toBeTruthy();expect(x.candidate).toBeFalsy();expect(x.marker).toBeUndefined();expect(x.count).toBe(x.before);
 await page.evaluate(r=>showCandidates({...r,name:'<img src=x onerror=window.pwned=1>'}),recipe);await expect(page.locator('#screen img')).toHaveCount(0);expect(await page.evaluate(()=>window.pwned)).toBeUndefined();
});
test('invalid back-up leaves both memory and durable storage unchanged',async({page})=>{
 await unlock(page);await page.evaluate(()=>{go('profile');vakOpen.backup=true;render();});const before=await page.evaluate(()=>JSON.stringify(pack()));
 for(const value of [{app:'panklaar',data:{...data(),family:[null]}},{...data(),recipes:[{...recipe,foto:'https://tracking.invalid/a.png'}]},JSON.parse('{"recipes":[],"__proto__":{"polluted":true}}'),{...data(),timers:[null]}]){
  await uploadBackup(page,value);await expect(page.locator('#toast')).toContainText('Ongeldige');expect(await page.evaluate(()=>JSON.stringify(pack()))).toBe(before);expect(await page.evaluate(()=>({}).polluted)).toBeUndefined();
 }
 await flush(page);await page.reload();await unlock(page,true);
});
test('legacy IndexedDB migration is committed before plaintext and old keys are removed',async({page})=>{
 await page.goto('/');await page.evaluate(async d=>{await idbReq('readwrite',s=>s.put(JSON.stringify(d),'panklaar:v1'));localStorage.setItem('panklaar_openai_key','synthetic-not-a-real-key');},data());await unlock(page);
 await page.evaluate(()=>go('recipes'));await expect(page.locator('#screen')).toContainText('Veilig testrecept');expect(await page.evaluate(()=>localStorage.getItem('panklaar_openai_key'))).toBeNull();expect(await page.evaluate(()=>idbReq('readonly',s=>s.get('panklaar:v1')))).toBeUndefined();
 await page.reload();await page.locator('#wachtwoordDialoog').waitFor({state:'visible'});if(await page.locator('#gebruikersnaamBlok').isVisible())await page.locator('#gebruikersnaam').fill('testgebruiker');await page.locator('#wachtwoord').fill('wrong-password');await page.locator('#wachtwoordDoorgaan').click();await expect(page.locator('#wachtwoordFout')).toContainText('Gebruikersnaam of wachtwoord klopt niet');await expect(page.locator('#screen')).not.toContainText('Veilig testrecept');
});
test('encrypted back-up migrates to another origin; modified ciphertext is rejected',async({page,browser})=>{
 await unlock(page);await uploadBackup(page,{app:'panklaar',data:data()});await confirmImport(page);
 await page.evaluate(()=>{go('profile');vakOpen.backup=true;render();});const download=page.waitForEvent('download');await page.locator('#backup-maak').click();const contents=fs.readFileSync(await(await download).path(),'utf8'),backup=JSON.parse(contents);expect(contents).not.toContain('Fictief gezinslid');expect(backup.format).toBe('panklaar-vault');
 const ctx=await browser.newContext(),other=await ctx.newPage();await other.goto('http://127.0.0.1:4173');await other.locator('#wachtwoordDialoog').waitFor({state:'visible'});if(await other.locator('#gebruikersnaamBlok').isVisible())await other.locator('#gebruikersnaam').fill('testgebruiker');await other.locator('#wachtwoord').fill(PASS);await other.locator('#wachtwoordHerhaal').fill(PASS);await other.locator('#wachtwoordDoorgaan').click();await expect(other.locator('#wachtwoordDialoog')).not.toBeVisible();
 const corrupt={...backup,ciphertext:(backup.ciphertext[0]==='A'?'B':'A')+backup.ciphertext.slice(1)};await uploadBackup(other,corrupt);await other.locator('#wachtwoordDialoog').waitFor({state:'visible'});if(await other.locator('#gebruikersnaamBlok').isVisible())await other.locator('#gebruikersnaam').fill('testgebruiker');await other.locator('#wachtwoord').fill(PASS);await other.locator('#wachtwoordDoorgaan').click();await expect(other.locator('#wachtwoordFout')).toContainText('Verkeerd wachtwoord');await other.locator('#wachtwoordAnnuleren').click();
 await uploadBackup(other,backup);await other.locator('#wachtwoordDialoog').waitFor({state:'visible'});if(await other.locator('#gebruikersnaamBlok').isVisible())await other.locator('#gebruikersnaam').fill('testgebruiker');await other.locator('#wachtwoord').fill(PASS);await other.locator('#wachtwoordDoorgaan').click();await confirmImport(other);await expect(other.locator('#screen')).toContainText('Veilig testrecept');await ctx.close();
});
test('AI keys remain only in memory; denied consent causes no API request',async({page})=>{
 await unlock(page);
 // Stub at the fetch boundary: WebKit service-worker requests may bypass page.route.
 await page.evaluate(()=>{const original=window.fetch;window.mockAiRequests=0;window.fetch=async(input,options)=>{const url=String(input);if(url==='https://api.openai.com/v1/responses'){window.mockAiRequests++;return new Response(JSON.stringify({output_text:'Testantwoord',usage:{input_tokens:1,output_tokens:1}}),{status:200,headers:{'Content-Type':'application/json'}});}if(new URL(url,location.href).origin!==location.origin)throw new Error('External test request blocked');return original(input,options);};S.aiDienst='openai';saveAiKey('synthetic-not-a-real-key');});
 page.once('dialog',d=>d.dismiss());const denied=await page.evaluate(async()=>{try{await aiRequest({messages:[{role:'user',content:'Fictieve test'}]});return false;}catch{return true;}});expect(denied).toBeTruthy();expect(await page.evaluate(()=>window.mockAiRequests)).toBe(0);
 page.once('dialog',d=>d.accept());expect(await page.evaluate(()=>aiRequest({messages:[{role:'user',content:'Fictieve test'}]}))).toBe('Testantwoord');expect(await page.evaluate(()=>window.mockAiRequests)).toBe(1);
 expect(await page.evaluate(()=>JSON.stringify({...localStorage}))).not.toContain('synthetic-not-a-real-key');expect(await page.evaluate(()=>JSON.stringify(pack()))).not.toContain('synthetic-not-a-real-key');await flush(page);await page.reload();await unlock(page,true);expect(await page.evaluate(()=>aiKey())).toBe('');
});
test('ingredient zero divisor, orphaned timers and storage failures are handled',async({page})=>{
 await unlock(page);expect(await page.evaluate(()=>parseIng('1/0 g rijst').qty)).toBeNull();expect(await page.evaluate(()=>scaleIng('1/0 g rijst',2))).not.toContain('Infinity');
 await page.evaluate(()=>{const r=S.recipes[0];S.timers=[{id:'timer1',label:'rijst',left:60,endAt:Date.now()+60000,running:true,done:false,recipeId:r.id,stepIdx:0}];go('recipes','detail',r.id);});await page.locator('[data-del]').click();expect(await page.evaluate(()=>S.timers.length)).toBe(0);await flush(page);
 await page.evaluate(()=>{const original=IDBObjectStore.prototype.put;IDBObjectStore.prototype.put=function(...args){if(this.name==='vault')throw new DOMException('Full','QuotaExceededError');return original.apply(this,args);};});await page.evaluate(()=>persist());await expect(page.locator('#toast')).toContainText('Opslaan mislukt');
});
test('a second writable tab is blocked and offline assets are complete',async({page,context})=>{
 await unlock(page);const second=await context.newPage();await second.goto('/');await expect(second.locator('#wachtwoordUitleg')).toContainText('ander tabblad');await second.close();
 await page.evaluate(()=>navigator.serviceWorker.ready);await context.setOffline(true);await page.reload();await page.locator('#wachtwoordDialoog').waitFor({state:'visible'});if(await page.locator('#gebruikersnaamBlok').isVisible())await page.locator('#gebruikersnaam').fill('testgebruiker');await page.locator('#wachtwoord').fill(PASS);await page.locator('#wachtwoordDoorgaan').click();await expect(page.locator('#screen')).toContainText('Panklaar');await context.setOffline(false);
});

test('family editing and stored allergy warnings still work without imported regular expressions',async({page})=>{
 await unlock(page);const state=data();state.recipes[0]={...recipe,steps:['Bereid eerst het ei in de pan.'],careDone:true,care:[{id:'egg',pat:'ei|eieren',who:['Fictief gezinslid'],warn:'Let op',fix:'Gebruik een vervanger'}]};
 await uploadBackup(page,{app:'panklaar',data:state});await confirmImport(page);
 await page.evaluate(()=>go('profile','memberEdit','family1'));await page.locator('#m-name').fill('Gewijzigde fictieve naam');await page.locator('[data-savemember]').click();await expect(page.locator('#screen')).toContainText('Gewijzigde fictieve naam');
 await page.evaluate(()=>openCook(S.recipes[0].id));await expect(page.locator('.cook-care')).toContainText('Gebruik een vervanger');await page.evaluate(()=>closeCook());
 await flush(page);await page.reload();await unlock(page,true);await page.evaluate(()=>go('profile','member','family1'));await expect(page.locator('#screen')).toContainText('Gewijzigde fictieve naam');
});
test('idle lock clears the key; cooking keeps the app available',async({page})=>{
 await page.clock.install();await unlock(page);await page.evaluate(()=>saveAiKey('synthetic-key'));
 await page.clock.fastForward(10*60*1000+1000);await expect(page.locator('#wachtwoordDialoog')).toBeVisible();
 await page.locator('#wachtwoordDialoog').waitFor({state:'visible'});if(await page.locator('#gebruikersnaamBlok').isVisible())await page.locator('#gebruikersnaam').fill('testgebruiker');await page.locator('#wachtwoord').fill(PASS);await page.locator('#wachtwoordDoorgaan').click();await expect(page.locator('#wachtwoordDialoog')).not.toBeVisible();expect(await page.evaluate(()=>aiKey())).toBe('');
 await page.evaluate(()=>openCook(S.recipes[0].id));await flush(page);await page.clock.fastForward(10*60*1000+1000);await expect(page.locator('#wachtwoordDialoog')).not.toBeVisible();await expect(page.locator('#cook')).toHaveClass(/on/);
});

test('large photo back-ups decode without regex stack overflow or unbounded argument spreads',async({page})=>{
 await unlock(page);
 await page.evaluate(async r=>{window.photoBackup=await PanklaarSecurity.backup({...pack(),recipes:[{...r,foto:'data:image/png;base64,'+'A'.repeat(4500000)}]});},recipe);
 const restored=page.evaluate(async()=>{const file=new File([window.photoBackup],'photos.json',{type:'application/json'});const d=await PanklaarSecurity.readBackup(file);return d.recipes[0].foto.length;});
 await page.locator('#wachtwoordDialoog').waitFor({state:'visible'});await page.locator('#wachtwoordDialoog').waitFor({state:'visible'});if(await page.locator('#gebruikersnaamBlok').isVisible())await page.locator('#gebruikersnaam').fill('testgebruiker');await page.locator('#wachtwoord').fill(PASS);await page.locator('#wachtwoordDoorgaan').click();expect(await restored).toBe(4500022);
});
