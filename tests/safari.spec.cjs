const{test,expect}=require('@playwright/test');
const PASS='Safari-regressie-wachtwoord-2026';
async function open(page,remember=false){
 await page.goto('/');await page.locator('#wachtwoordDialoog').waitFor({state:'visible'});if(await page.locator('#gebruikersnaamBlok').isVisible())await page.locator('#gebruikersnaam').fill('testgebruiker');await page.locator('#wachtwoord').fill(PASS);await page.locator('#wachtwoordHerhaal').fill(PASS);if(remember)await page.locator('#rememberDialog').check();await page.locator('#wachtwoordDoorgaan').click();await expect(page.locator('#wachtwoordDialoog')).not.toBeVisible();await expect(page.locator('#screen')).toContainText('Panklaar');
}
async function enterPassword(page){await page.locator('#wachtwoordDialoog').waitFor({state:'visible'});if(await page.locator('#gebruikersnaamBlok').isVisible())await page.locator('#gebruikersnaam').fill('testgebruiker');await page.locator('#wachtwoord').fill(PASS);await page.locator('#wachtwoordDoorgaan').click();await expect(page.locator('#wachtwoordDialoog')).not.toBeVisible();}
async function image(page){const value=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=320;c.height=240;const ctx=c.getContext('2d');ctx.fillStyle='#13a66b';ctx.fillRect(0,0,c.width,c.height);return c.toDataURL('image/png').split(',')[1];});return {name:'recept.png',mimeType:'image/png',buffer:Buffer.from(value,'base64')};}
async function choosePhoto(page,button,file){const chooser=page.waitForEvent('filechooser');await button.tap();await(await chooser).setFiles(file);}
test('mobile app fills the viewport without the security banner squeezing it sideways',async({page})=>{
 await open(page);
 for(const tab of ['home','recipes','shopping','plan','profile']){
  await page.locator(`#nav [data-tab="${tab}"]`).tap();
  const sizes=await page.evaluate(()=>{const r=document.querySelector('.phone').getBoundingClientRect();return{viewport:innerWidth,body:document.body.scrollWidth,left:r.left,width:r.width,screen:document.getElementById('screen').getBoundingClientRect().width};});
  expect(sizes.body).toBeLessThanOrEqual(sizes.viewport+1);expect(sizes.left).toBeGreaterThanOrEqual(0);expect(sizes.width).toBe(sizes.viewport);expect(sizes.screen).toBe(sizes.viewport);
 }
 await page.locator('#nav [data-tab="home"]').tap();await expect(page.locator('#screen')).not.toContainText('Je gegevens en nieuwe back-ups zijn versleuteld');await page.screenshot({path:test.info().outputPath('mobile-home.png')});
});
test('a photo is visible in a new recipe before saving, without losing typed fields',async({page})=>{
 await open(page);const file=await image(page);await page.locator('[data-go="new"]').tap();
 await page.locator('#f-name').fill('Mijn gefotografeerde recept');await page.locator('#f-mins').fill('25');await page.locator('#f-ing').fill('200 g rijst\n100 g kip');await page.locator('#f-steps').fill('Kook de rijst 12 min.');await page.locator('#f-tips').fill('Voeg wat peper toe.');
 await choosePhoto(page,page.locator('#f-foto'),file);
 const preview=page.locator('#edit-photo-preview img');await expect(preview).toBeVisible();await expect.poll(()=>preview.evaluate(img=>img.complete&&img.naturalWidth>0)).toBeTruthy();
 await expect(page.locator('#f-name')).toHaveValue('Mijn gefotografeerde recept');await expect(page.locator('#f-mins')).toHaveValue('25');await expect(page.locator('#f-tips')).toHaveValue('Voeg wat peper toe.');
 await page.locator('[data-save]').tap();await expect(page.locator('.lijstje img')).toBeVisible();await page.evaluate(()=>PanklaarSecurity.flush());
 await page.reload();await enterPassword(page);await page.locator('#nav [data-tab="recipes"]').tap();await page.locator('[data-open]').filter({hasText:'Mijn gefotografeerde recept'}).tap();await expect(page.locator('.lijstje img')).toBeVisible();
});
test('recipe import shows the selected photo before any AI request and preserves comments',async({page})=>{
 await open(page);const file=await image(page);await page.locator('#nav [data-tab="recipes"]').tap();await page.locator('[data-go="import"]').tap();await page.locator('#imp-titel').fill('Titel bij mijn foto');await page.locator('#imp-tweak').fill('Zonder ui');
 await choosePhoto(page,page.locator('#imp-foto-btn'),file);const preview=page.locator('.imp-foto img');await expect(preview).toBeVisible();await expect.poll(()=>preview.evaluate(img=>img.naturalWidth>0)).toBeTruthy();await expect(preview).toHaveCount(1);await expect(page.locator('#imp-titel')).toHaveValue('Titel bij mijn foto');await expect(page.locator('#imp-tweak')).toHaveValue('Zonder ui');
});
test('week planner can be opened, chosen, changed and cleared using taps',async({page})=>{
 await open(page);await page.locator('#nav [data-tab="plan"]').tap();await page.locator('[data-plan-day="Ma"]').tap();await expect(page.locator('#menu')).toBeVisible();await page.locator('#menu .menu-item').filter({hasText:'Pasta met courgette en citroen'}).tap();await expect(page.locator('[data-plan-day="Ma"]')).toContainText('Pasta met courgette');
 await page.locator('[data-plan-day="Ma"]').tap();await page.locator('#menu .menu-item').filter({hasText:'Wraps met kip'}).tap();await expect(page.locator('[data-plan-day="Ma"]')).toContainText('Wraps');await page.evaluate(()=>PanklaarSecurity.flush());await page.reload();await enterPassword(page);await page.locator('#nav [data-tab="plan"]').tap();await expect(page.locator('[data-plan-day="Ma"]')).toContainText('Wraps');
 await page.locator('[data-plan-day="Ma"]').tap();await page.locator('#menu .menu-item').filter({hasText:'Geen maaltijd gepland'}).tap();await expect(page.locator('[data-plan-day="Ma"]')).toContainText('Kies een recept');
});
test('pantry accepts keyboard input and saves using both Enter and the plus button',async({page})=>{
 await open(page);await page.locator('#nav [data-tab="shopping"]').tap();await page.locator('[data-pantmenu]').tap();const field=page.locator('#pan-in');await field.tap();await expect(field).toBeFocused();await field.pressSequentially('tomaat');await field.press('Enter');await expect(page.locator('[data-pan="tomaat"]')).toBeVisible();
 await field.tap();await field.pressSequentially('pasta');await page.locator('#pan-add').tap();await expect(page.locator('[data-pan="pasta"]')).toBeVisible();await page.evaluate(()=>PanklaarSecurity.flush());await page.reload();await enterPassword(page);await page.locator('#nav [data-tab="shopping"]').tap();await page.locator('[data-pantmenu]').tap();await expect(page.locator('[data-pan="tomaat"]')).toBeVisible();await expect(page.locator('[data-pan="pasta"]')).toBeVisible();
});
test('timer uses the timed action instead of the first ingredient and supports correcting its subject',async({page})=>{
 await open(page);const labels=await page.evaluate(()=>{
  const ingredients=['300 g kipfilet','200 g rijst','1 rode ui','100 ml witte wijn','200 g witte rijst'];
  return ['Snijd de kip. Kook de rijst 12 minuten.','Kook rijst en bak de kip 8 minuten.','Snipper de ui en kook de rijst 10 min.','Voeg de witte wijn toe en laat 2 min inkoken.'].map(step=>timerLabel(step,ingredients,step.search(/\d+\s*(min|minuten)/)));
 });expect(labels).toEqual(['rijst','kipfilet','rijst','wijn']);
 await page.evaluate(()=>{S.recipes[0].steps=['Snijd de kip. Kook de rijst 12 minuten.'];S.recipes[0].ingredients=['300 g kipfilet','200 g rijst'];openCook(S.recipes[0].id);});await expect(page.locator('#cook-timer-label')).toHaveValue('rijst');await page.locator('#cook-timer-label').fill('Rijst zacht koken');await page.locator('[data-addtimer]').tap();await expect(page.locator('#cookTimers')).toContainText('Rijst zacht koken');expect(await page.evaluate(()=>S.timers[0].label)).toBe('Rijst zacht koken');
});
test('timer names the food added to the pan, including additions from the preceding step',async({page})=>{
 await open(page);
 const labels=await page.evaluate(()=>{
  const list=['300 g kipfilet','200 g rijst','1 rode ui','2 tenen knoflook','20 g boter','100 ml witte wijn'];
  return [
   ['Bak de kip in boter. Voeg de ui toe en bak 5 minuten.','ui'],
   ['Voeg de ui toe aan de kip en laat 5 minuten bakken.','ui'],
   ['Voeg de ui en knoflook toe en bak 3 minuten.','ui en knoflook'],
   ['Smelt de boter 2 minuten.','boter'],
   ['Kook de rijst 12 minuten en bak daarna de kip.','rijst'],
   ['Bak de kip 5 minuten. Voeg daarna de ui toe.','kipfilet'],
   ['Verwarm de oven 10 minuten voor.','oven'],
  ].map(([step,expected])=>({actual:timerLabel(step,list,step.search(/\d+\s*min/)),expected}));
 });
 for(const label of labels)expect(label.actual).toBe(label.expected);
 await page.evaluate(()=>{S.recipes[0].steps=['Bak de kip. Voeg de ui toe aan de kip.','Laat 5 minuten bakken.'];S.recipes[0].ingredients=['300 g kipfilet','1 rode ui'];openCook(S.recipes[0].id);});
 await page.locator('#cookNext').tap();await expect(page.locator('#cook-timer-label')).toHaveValue('ui');await page.locator('[data-addtimer]').tap();await expect(page.locator('#cookTimers')).toContainText('ui');expect(await page.evaluate(()=>S.timers[0].label)).toBe('ui');
});

test('trusted device stays unlocked after reload but manual locking revokes it',async({page})=>{
 await open(page,true);await page.evaluate(()=>{S.pantry.push('bewaarde tomaat');saveAiKey('synthetic-session-key');return persist();});await page.evaluate(()=>PanklaarSecurity.flush());await page.reload();await expect(page.locator('#screen')).toContainText('Panklaar');await expect(page.locator('#wachtwoordDialoog')).not.toBeVisible();expect(await page.evaluate(()=>PanklaarSecurity.isRemembered())).toBeTruthy();expect(await page.evaluate(()=>aiKey())).toBe('');expect(await page.evaluate(()=>S.pantry)).toContain('bewaarde tomaat');
 await page.locator('#nav [data-tab="profile"]').tap();await expect(page.locator('#remember-device')).toBeChecked();await page.locator('#pk-lock').tap();await expect(page.locator('#wachtwoordDialoog')).toBeVisible();await enterPassword(page);expect(await page.evaluate(()=>PanklaarSecurity.isRemembered())).toBeFalsy();
});
test('remembering can be disabled and expires without losing encrypted data',async({page})=>{
 await open(page);await page.locator('#nav [data-tab="profile"]').tap();await page.locator('#remember-device').check();await expect.poll(()=>page.evaluate(()=>PanklaarSecurity.isRemembered())).toBeTruthy();await page.reload();await expect(page.locator('#screen')).toContainText('Panklaar');
 await page.evaluate(()=>new Promise((resolve,reject)=>{const r=indexedDB.open('panklaar-secure',1);r.onsuccess=()=>{const db=r.result,tx=db.transaction('vault','readwrite'),s=tx.objectStore('vault'),q=s.get('remember-v1');q.onsuccess=()=>{const v=q.result;v.expiresAt=Date.now()-1;s.put(v,'remember-v1');};tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>reject(tx.error);};}));
 await page.reload();await expect(page.locator('#wachtwoordDialoog')).toBeVisible();await enterPassword(page);await page.locator('#nav [data-tab="profile"]').tap();await page.locator('#remember-device').check();await expect.poll(()=>page.evaluate(()=>PanklaarSecurity.isRemembered())).toBeTruthy();await page.locator('#remember-device').uncheck();await expect.poll(()=>page.evaluate(()=>PanklaarSecurity.isRemembered())).toBeFalsy();await page.reload();await expect(page.locator('#wachtwoordDialoog')).toBeVisible();
});

test('profile sections are operable with Safari taps as native buttons',async({page})=>{
 await open(page);await page.locator('#nav [data-tab="profile"]').tap();
 await page.locator('[data-fam]').tap();await expect(page.locator('[data-memberedit="new"]')).toBeVisible();
 await page.locator('[data-prefmenu]').tap();await expect(page.locator('[data-slider="veg"]')).toBeVisible();
 await page.locator('[data-equipmenu]').tap();await expect(page.locator('[data-equip="hob"]')).toBeVisible();
 await page.locator('[data-vak="ai"]').tap();await expect(page.locator('#ai-key')).toBeVisible();
 await page.locator('[data-vak="backup"]').tap();await expect(page.locator('#backup-maak')).toBeVisible();
});
