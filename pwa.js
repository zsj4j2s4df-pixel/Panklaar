/* Keep offline app updates best-effort. An offline or interrupted update must
   never reject outside a handler or interrupt recipe/photo input. */
if('serviceWorker' in navigator){
  const controlledAtStart=!!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange',()=>{
    if(!controlledAtStart||window.__herladen)return;
    window.__herladen=true;location.reload();
  });
  async function checkUpdate(registration){
    try{const reg=registration||await navigator.serviceWorker.getRegistration();if(reg)await reg.update();}
    catch{/* Offline, closing the page or an interrupted update: retry next time. */}
  }
  window.addEventListener('load',()=>{
    navigator.serviceWorker.register('service-worker.js',{updateViaCache:'none'})
      .then(reg=>checkUpdate(reg)).catch(()=>{});
  });
  setInterval(()=>{void checkUpdate();},30*60*1000);
}
