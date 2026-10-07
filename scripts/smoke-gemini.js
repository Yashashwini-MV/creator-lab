import '../server/env.js';import {callAI} from '../server/services/ai.js';
if(!process.env.AI_API_KEY){console.log('NOT RUN: AI_API_KEY missing');process.exit(2)}
try{const r=await callAI('coach',{experiments:[{title:'5 College Outfits Under ₹1,000',views:18400,saves:620}]},'Why did my last Reel perform well?');console.log('OK Gemini responded:',r.answer.slice(0,200))}catch(e){console.log('FAIL',e.code);process.exit(1)}
