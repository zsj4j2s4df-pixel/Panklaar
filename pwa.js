/* PWA: service worker registreren, en meteen kijken of er een nieuwe
   versie klaarstaat. Neemt die het over, dan laden we een keer opnieuw,
   zodat je nooit op een oude versie blijft hangen. */
if('serviceWorker' in navigator){
  const alDaar = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange', ()=>{
    if(!alDaar || window.__herladen) return;
    window.__herladen = true; location.reload();
  });
  window.addEventListener('load', ()=>{
    /* updateViaCache:'none' dwingt de browser om service-worker.js zelf
       ook nooit uit de gewone HTTP-cache te lezen bij een update-check.
       Zonder dit kan een telefoon (vooral als thuisschermapp) het
       bestand als "ongewijzigd" blijven zien terwijl er allang een
       nieuwe versie op GitHub staat — en dan verandert er dus nooit
       iets, hoe vaak we CACHE ook ophogen. */
    navigator.serviceWorker.register('service-worker.js', {updateViaCache:'none'})
      .then(reg=>{ try{ reg.update(); }catch(e){} })
      .catch(()=>{});
  });
  setInterval(()=>{ navigator.serviceWorker.getRegistration().then(r=>{ if(r) try{ r.update(); }catch(e){} }); }, 30*60*1000);
}
