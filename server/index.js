import './env.js';
import http from 'node:http';import {readFileSync} from 'node:fs';
import {callAI,SCHEMAS} from './services/ai.js';
const MSG={NO_KEY:'demo-fallback',MALFORMED:"We couldn't confidently interpret the result."};
http.createServer(async(req,res)=>{
 const send=(c,o)=>{res.writeHead(c,{'content-type':'application/json'});res.end(JSON.stringify(o))};
 if(req.method==='GET'&&req.url==='/'){res.writeHead(200,{'content-type':'text/html'});return res.end(readFileSync(new URL('../creator-lab.html',import.meta.url)))}
 if(req.url==='/api/status')return send(200,{ai:!!process.env.AI_API_KEY});

 if(req.method==='GET'&&req.url==='/api/config'){
  return send(200,{
    supabaseUrl:process.env.SUPABASE_URL,
    supabasePublishableKey:process.env.SUPABASE_PUBLISHABLE_KEY
  });
}
 const m=req.url.match(/^\/api\/ai\/([a-z-]+)$/);
 if(req.method!=='POST'||!m||!SCHEMAS[m[1]])return send(404,{error:'Not found'});
 let body='';for await(const c of req)body+=c;
 try{const {context,question}=JSON.parse(body||'{}');send(200,{source:'ai',data:await callAI(m[1],context,question)})}
 catch(e){const fb=e.code==='NO_KEY';send(fb?503:502,{source:'fallback',fallback:fb,error:MSG[e.code]||"We couldn't complete that analysis right now."})}
}).listen(process.env.PORT||3000,()=>console.log('Creator Lab on :'+(process.env.PORT||3000)));
