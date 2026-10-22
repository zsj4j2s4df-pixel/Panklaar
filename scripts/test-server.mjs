import http from 'node:http';
import worker from '../worker.mjs';
http.createServer(async(req,res)=>{
  try{
    const response=worker.fetch(new Request('http://localhost:4173'+req.url,{method:req.method}));
    // The local harness is HTTP: WebKit upgrades even loopback subresources otherwise.
    const headers=new Headers(response.headers);headers.set('Content-Security-Policy',headers.get('Content-Security-Policy').replace('; upgrade-insecure-requests',''));
    res.writeHead(response.status,Object.fromEntries(headers));
    res.end(Buffer.from(await response.arrayBuffer()));
  }catch{res.writeHead(500);res.end('Internal error');}
}).listen(4173,'127.0.0.1');
