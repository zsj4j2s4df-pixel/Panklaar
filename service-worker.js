'use strict';
const CACHE='panklaar-v39';
const ASSETS=['./','./index.html','./security.js','./app.js','./pwa.js','./manifest.json','./icon-192.png','./icon-512.png'];
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const cache=await caches.open(CACHE);
 await Promise.all(ASSETS.map(async path=>{const response=await fetch(path,{cache:'no-store'});if(!response.ok)throw new Error('Appbestand ontbreekt');await cache.put(path,response);}));
 await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 const keys=await caches.keys();await Promise.all(keys.filter(k=>k.startsWith('panklaar-')&&k!==CACHE).map(k=>caches.delete(k)));await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 if(event.request.method!=='GET'||url.origin!==self.location.origin)return;
 const base=new URL('./',self.location.href);
 if(event.request.mode==='navigate'){
  event.respondWith(fetch(event.request,{cache:'no-store'}).catch(async()=>await caches.match(new URL('index.html',base).href)||Response.error()));return;
 }
 if(!ASSETS.some(path=>new URL(path,base).pathname===url.pathname))return;
 event.respondWith(caches.open(CACHE).then(async cache=>await cache.match(event.request,{ignoreSearch:true})||fetch(event.request)));
});
