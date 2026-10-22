'use strict';
const PanklaarSecurity=(()=>{
 const MAX=32*1024*1024,ITER=600000,enc=new TextEncoder(),dec=new TextDecoder('utf-8',{fatal:true});
 const fail=()=>{throw new Error('Ongeldige of te grote gegevens. Je opgeslagen gegevens zijn niet vervangen.');};
 const obj=x=>x!==null&&typeof x==='object'&&!Array.isArray(x)&&[Object.prototype,null].includes(Object.getPrototypeOf(x));
 const fields=(x,keys)=>{if(!obj(x)||Object.keys(x).some(k=>!keys.includes(k)))fail();};
 const text=(x='',max=100000)=>{if(typeof x!=='string'||x.length>max)fail();return x;};
 const num=(x=0,min=0,max=1e15)=>{if(typeof x!=='number'||!Number.isFinite(x)||x<min||x>max)fail();return x;};
 const bool=(x=false)=>{if(typeof x!=='boolean')fail();return x;};
 const arr=(x=[],max=1000)=>{if(!Array.isArray(x)||x.length>max)fail();return x;};
 const strings=(x,max=1000)=>arr(x,max).map(v=>text(v));
 const id=x=>{text(x,100);if(!/^[a-zA-Z0-9_-]+$/.test(x)||['__proto__','constructor','prototype','new'].includes(x))fail();return x;};
 const choice=(x,list,fallback)=>{if(x===undefined)return fallback;if(!list.includes(x))fail();return x;};
 const ids=(x,max=1000)=>arr(x,max).map(id);
 function photo(x=''){
  text(x,5*1024*1024);if(x&&!/^data:image\/(?:png|jpeg|webp);base64,[a-zA-Z0-9+/]*={0,2}$/.test(x))fail();return x;
 }
 function tip(t){
  if(typeof t==='string')return {text:text(t),add:[],step:null,on:false};
  fields(t,['text','tekst','add','ingredienten','step','stap','na','on']);
  let step=t.step;
  if(step!=null){fields(step,['after','text']);step={after:num(step.after,0,1000),text:text(step.text)};}
  else if(t.stap)step={after:num(t.na,0,1000),text:text(t.stap)};
  return {text:text(t.text??t.tekst??''),add:strings(t.add??t.ingredienten??[]),step:step??null,on:bool(t.on)};
 }
 function recipe(r,{newId=false}={}){
  fields(r,['id','name','type','mins','serves','level','ingredients','steps','tips','uitleg','letop','foto','have','care','careDone']);
  const out={id:newId?crypto.randomUUID():id(r.id),name:text(r.name,1000),type:choice(r.type,['breakfast','lunch','lunchtogo','dinner','side','sweet'],'dinner'),mins:num(r.mins??0,0,10080),serves:num(r.serves??2,1,1000),level:choice(r.level,['easy','medium','hard'],'easy'),ingredients:strings(r.ingredients),steps:strings(r.steps)};
  if(r.tips!==undefined)out.tips=arr(r.tips,100).map(tip);
  for(const k of ['uitleg'])if(r[k]!==undefined)out[k]=text(r[k]);
  for(const k of ['letop','have'])if(r[k]!==undefined)out[k]=strings(r[k]);
  if(r.foto)out.foto=photo(r.foto);
  if(r.careDone!==undefined)out.careDone=bool(r.careDone);
  if(r.care!==undefined)out.care=arr(r.care,100).map(c=>{fields(c,['id','pat','who','stepIdx','on','warn','fix']);return {id:text(c.id,500),pat:text(c.pat,2000),who:strings(c.who,64),stepIdx:num(c.stepIdx??-1,-1,1000),on:bool(c.on),warn:text(c.warn),fix:text(c.fix)};});
  return out;
 }
 function unique(values){const seen=new Set();for(const v of values){if(seen.has(v.id))fail();seen.add(v.id);}return values;}
 function validate(d){
  fields(d,['recipes','shopping','pantry','plan','theme','family','equip','prefs','timers','usage','budget','aiDienst','aiModellen']);
  if(enc.encode(JSON.stringify(d)).length>MAX)fail();
  const out={recipes:unique(arr(d.recipes,1000).map(r=>recipe(r))),shopping:unique(arr(d.shopping,10000).map(x=>{fields(x,['id','text','done','from']);return {id:id(x.id),text:text(x.text),done:bool(x.done),from:text(x.from??'')};})),pantry:strings(d.pantry,10000),plan:{},theme:choice(d.theme,['auto','light','dark'],'auto'),family:[],equip:ids(d.equip,100),prefs:{veg:7,fish:1,meat:3,flags:[]},timers:[],usage:{},budget:num(d.budget??5,0,1e9),aiDienst:choice(d.aiDienst,['anthropic','openai'],'anthropic'),aiModellen:{}};
  fields(d.plan??{},['Ma','Di','Wo','Do','Vr','Za','Zo']);for(const[k,v]of Object.entries(d.plan??{}))out.plan[k]=v?id(v):'';
  out.family=unique(arr(d.family,64).map(m=>{
   fields(m,['id','name','stages','eat','note','allergies','allergyText','ai']);
   const member={id:id(m.id),name:text(m.name,1000),stages:arr(m.stages,20).map(x=>choice(x,['pregnant','breastfeeding','unborn','infant_6_12','toddler_1_3','child_4_12','none'],'none')),eat:bool(m.eat),note:text(m.note??''),allergies:arr(m.allergies,100).map(x=>choice(x,['gluten','melk','ei','pinda','noten','soja','vis','schaal','week','sesam','selderij','mosterd','lupine','sulfiet'],'gluten')),allergyText:text(m.allergyText??'')};
   if(m.ai){fields(m.ai,['avoid','limit','ok','bronnen','when']);member.ai={avoid:strings(m.ai.avoid),limit:strings(m.ai.limit),ok:strings(m.ai.ok),bronnen:strings(m.ai.bronnen),when:num(m.ai.when)};}
   return member;
  }));
  if(d.prefs){fields(d.prefs,['veg','fish','meat','flags','level','ai','count','veeg']);out.prefs={veg:num(d.prefs.veg??7,0,7),fish:num(d.prefs.fish??1,0,7),meat:num(d.prefs.meat??3,0,7),flags:ids(d.prefs.flags,100),level:choice(d.prefs.level,['any','easy','medium','hard'],'any'),count:num(d.prefs.count??3,1,5),veeg:bool(d.prefs.veeg??true),ai:{}};fields(d.prefs.ai??{},['search','schijf','tips','uitleg']);for(const[k,v]of Object.entries(d.prefs.ai??{}))out.prefs.ai[k]=bool(v);}
  out.timers=unique(arr(d.timers,100).map(t=>{fields(t,['id','label','left','endAt','running','done','recipeId','stepIdx']);return {id:id(t.id),label:text(t.label,1000),left:num(t.left,0,604800),endAt:t.endAt===null?null:num(t.endAt),running:bool(t.running),done:bool(t.done),recipeId:id(t.recipeId),stepIdx:num(t.stepIdx,0,1000)};}));
  if(d.usage){if(!obj(d.usage)||Object.keys(d.usage).length>600)fail();for(const[k,v]of Object.entries(d.usage)){if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(k))fail();fields(v,['calls','in','out','cw','cr','zoek','kosten','gewaarschuwd']);const m={};for(const n of ['calls','in','out','cw','cr','zoek','kosten'])m[n]=num(v[n]);m.gewaarschuwd=arr(v.gewaarschuwd,10).map(x=>num(x,0,100));out.usage[k]=m;}}
  fields(d.aiModellen??{},['openai','anthropic']);for(const[k,v]of Object.entries(d.aiModellen??{}))out.aiModellen[k]=text(v,200);
  return out;
 }
 function db(){return new Promise((resolve,reject)=>{const r=indexedDB.open('panklaar-secure',1);r.onupgradeneeded=()=>r.result.createObjectStore('vault');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
 async function storage(mode,value,slot='v1'){const database=await db();try{return await new Promise((resolve,reject)=>{const tx=database.transaction('vault',mode),s=tx.objectStore('vault');const req=mode==='readonly'?s.get(slot):value===undefined?s.delete(slot):s.put(value,slot);tx.oncomplete=()=>resolve(req.result);tx.onerror=tx.onabort=()=>reject(tx.error||new Error('Opslaan mislukt'));});}finally{database.close();}}
 const b64=bytes=>{const chunks=[];for(let i=0;i<bytes.length;i+=32768)chunks.push(String.fromCharCode(...bytes.subarray(i,i+32768)));return btoa(chunks.join(''));};
 const from64=s=>{if(typeof s!=='string'||s.length>MAX*1.4||s.length%4!==0||!/^[A-Za-z0-9+/]*={0,2}$/.test(s))fail();const decoded=atob(s),bytes=new Uint8Array(decoded.length);for(let i=0;i<decoded.length;i++)bytes[i]=decoded.charCodeAt(i);return bytes;};
 let key,salt,data=null,queue=Promise.resolve(),pending=0,failed=false,active=false,rememberUntil=0;
 const aad=enc.encode('panklaar-vault:1:PBKDF2-SHA256:600000:AES-256-GCM');
 async function derive(password,s){const base=await crypto.subtle.importKey('raw',enc.encode(password),'PBKDF2',false,['deriveKey']);return crypto.subtle.deriveKey({name:'PBKDF2',hash:'SHA-256',salt:s,iterations:ITER},base,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);}
 async function encrypt(value){const bytes=enc.encode(JSON.stringify(value));if(bytes.length>MAX)fail();const iv=crypto.getRandomValues(new Uint8Array(12));const cipher=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:aad},key,bytes);return {format:'panklaar-vault',version:1,kdf:'PBKDF2-SHA256',iterations:ITER,salt:b64(salt),iv:b64(iv),ciphertext:b64(new Uint8Array(cipher))};}
 function parts(e){fields(e,['format','version','kdf','iterations','salt','iv','ciphertext']);if(e.format!=='panklaar-vault'||e.version!==1||e.kdf!=='PBKDF2-SHA256'||e.iterations!==ITER)fail();const s=from64(e.salt),iv=from64(e.iv),c=from64(e.ciphertext);if(s.length!==16||iv.length!==12||c.length<16)fail();return {s,iv,c};}
 async function decryptWithKey(e,k){const{iv,c}=parts(e);const plain=JSON.parse(dec.decode(await crypto.subtle.decrypt({name:'AES-GCM',iv,additionalData:aad},k,c)));return plain===null?null:validate(plain);}
 async function decrypt(e,password){const{s}=parts(e),k=await derive(password,s);return {key:k,salt:s,data:await decryptWithKey(e,k)};}
 const isRemembered=()=>rememberUntil>Date.now();
 async function setRemembered(remember){
  if(!remember){await storage('readwrite',undefined,'remember-v1');rememberUntil=0;return;}
  if(!key||!salt)throw new Error('Ontgrendel Panklaar eerst met je wachtwoord.');
  const expiresAt=Date.now()+30*24*60*60*1000;
  // Explicit trusted-device opt-in. The non-extractable CryptoKey is never exported or backed up.
  try{await storage('readwrite',{key,salt:b64(salt),expiresAt},'remember-v1');rememberUntil=expiresAt;}
  catch{throw new Error('Deze browser kan dit apparaat niet onthouden. Je wachtwoord blijft nodig.');}
 }
 function passwordDialog(options){const el=document.getElementById('wachtwoordDialoog'),form=document.getElementById('wachtwoordFormulier'),p=document.getElementById('wachtwoord'),r=document.getElementById('wachtwoordHerhaal'),error=document.getElementById('wachtwoordFout'),button=document.getElementById('wachtwoordDoorgaan'),cancel=document.getElementById('wachtwoordAnnuleren');document.getElementById('wachtwoordTitel').textContent=options.title;document.getElementById('wachtwoordUitleg').textContent=options.description;p.value='';r.value='';p.autocomplete=options.create?'new-password':'current-password';r.required=!!options.create;document.getElementById('wachtwoordHerhaalBlok').hidden=!options.create;document.getElementById('rememberDialogLabel').hidden=!options.remember;document.getElementById('rememberDialog').checked=false;cancel.hidden=!options.cancel;error.textContent='';button.textContent=options.create?'Beveiliging instellen':'Ontgrendelen';return new Promise(resolve=>{let busy=false;const abort=()=>{if(options.cancel&&!busy){el.close();resolve(null);}};cancel.onclick=abort;el.oncancel=e=>{e.preventDefault();abort();};form.onsubmit=async e=>{e.preventDefault();if(busy)return;if(options.create&&(p.value.length<12||p.value!==r.value)){error.textContent='Kies minstens 12 tekens en vul tweemaal hetzelfde wachtwoord in.';return;}busy=true;button.disabled=cancel.disabled=true;error.textContent='Even geduld…';try{const value=await options.action(p.value,options.remember&&document.getElementById('rememberDialog').checked);p.value=r.value='';el.close();resolve(value);}catch(e){error.textContent=e.name==='OperationError'?'Verkeerd wachtwoord of beschadigd bestand.':e.message;}finally{busy=false;button.disabled=cancel.disabled=false;}};el.showModal();p.focus();});}
 async function open(legacy,cleanup){
  if(!crypto.subtle||!navigator.locks)throw new Error('Gebruik HTTPS en een recente browser met Web Crypto en Web Locks.');
  return new Promise((resolve,reject)=>{navigator.locks.request('panklaar-vault-session',{ifAvailable:true},async lock=>{if(!lock){reject(new Error('Panklaar staat al open in een ander tabblad. Sluit dat eerst.'));return;}try{
   const stored=await storage('readonly');
   let automaticallyOpened=false;
   const remembered=await storage('readonly',undefined,'remember-v1');
   if(stored&&remembered){
    try{
     if(!Number.isFinite(remembered.expiresAt)||remembered.expiresAt<=Date.now()||remembered.expiresAt>Date.now()+31*24*60*60*1000||remembered.salt!==stored.salt||!(remembered.key instanceof CryptoKey)||remembered.key.extractable)throw new Error('Verlopen apparaat');
     data=await decryptWithKey(stored,remembered.key);key=remembered.key;salt=parts(stored).s;rememberUntil=remembered.expiresAt;automaticallyOpened=true;
    }catch{await setRemembered(false);}
   }
   if(stored&&!automaticallyOpened){parts(stored);await passwordDialog({title:'Panklaar ontgrendelen',remember:true,description:'Je recepten en gezinsgegevens blijven versleuteld op dit apparaat.',action:async(password,remember)=>{const unlocked=await decrypt(stored,password);key=unlocked.key;salt=unlocked.salt;data=unlocked.data;if(remember)await setRemembered(true);return true;}});}
   else if(!stored){const old=await legacy();const clean=old?validate(old):null;await passwordDialog({title:'Beveilig Panklaar',create:true,remember:true,description:'Kies minstens 12 tekens. Bewaar je wachtwoord in een wachtwoordmanager: zonder wachtwoord zijn je gegevens en back-ups niet te herstellen. Bestaande gegevens worden veilig overgezet.',action:async(password,remember)=>{salt=crypto.getRandomValues(new Uint8Array(16));key=await derive(password,salt);await storage('readwrite',await encrypt(clean));data=clean;if(remember)await setRemembered(true);return true;}});}
   await cleanup();active=true;resolve();await new Promise(()=>{});
  }catch(e){reject(e);}}).catch(reject);});
 }
 function save(value){if(!active)return Promise.resolve(false);let clean;try{clean=validate(value);}catch{return Promise.resolve(false);}pending++;const task=queue.catch(()=>{}).then(async()=>{await storage('readwrite',await encrypt(clean));data=clean;failed=false;return true;}).catch(()=>{failed=true;return false;}).finally(()=>pending--);queue=task;return task;}
 async function flush(){await queue;if(failed)throw new Error('Opslaan is mislukt. Maak eerst een back-up.');}
 async function backup(value){return JSON.stringify(await encrypt(validate(value)));}
 async function readBackup(file){if(!file||file.size>48*1024*1024)fail();const parsed=JSON.parse(await file.text());if(parsed?.format==='panklaar-vault'){parts(parsed);return passwordDialog({title:'Back-up ontgrendelen',description:'Vul het wachtwoord in waarmee de back-up is gemaakt.',cancel:true,action:async password=>(await decrypt(parsed,password)).data});}if(parsed?.app&&parsed.app!=='panklaar')fail();return validate(parsed?.data??parsed);}
 window.addEventListener('beforeunload',e=>{if(pending||failed){e.preventDefault();e.returnValue='';}});
 window.addEventListener('pageshow',e=>{if(e.persisted)location.reload();});
 return {open,setRemembered,isRemembered,get:()=>structuredClone(data),save,flush,backup,readBackup,validate,recipe,photo};
})();
