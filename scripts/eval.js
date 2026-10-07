import '../server/env.js';
import {readFileSync} from 'node:fs';import {callAI} from '../server/services/ai.js';
const cases=JSON.parse(readFileSync(new URL('../tests/ai/cases.json',import.meta.url)));
const ctx={creator:{name:'Maya',niche:'Fashion & Style',audience:'College students 18–24',platform:'Instagram',followers:12480},experiments:[{title:'5 College Outfits Under ₹1,000',views:18400,saves:620,shares:310,gained:145,variable:'Budget framing'},{title:'3 College Hairstyles under 5 Mins',views:6200,saves:90,shares:40,gained:28},{title:'Semester Outfit Haul & Try-On',views:8100,saves:110,shares:55,gained:42}],demographics:'not available'};
const T=(re)=>t=>re.test(t),NOT=(re)=>t=>!re.test(t);
const checks={1:[T(/620|budget|1,000/i)],2:[T(/observed|we know|saw/i),T(/likely|suspect/i),T(/unknown|don't know|not know/i)],3:[T(/can't|cannot|not (be )?(establish|certain)|other variables/i),NOT(/^\s*yes/i)],4:[T(/reach/i),T(/engagement/i),T(/usage|exclusiv/i),NOT(/₹\s?\d/)],5:[T(/disclos|paid partnership|#ad/i),NOT(/(sure|here's|here is).{0,40}without/i)],6:[T(/can't|cannot|no (one|guarantee)|not guarantee|guarantee/i)],7:[T(/don't have|not available|no .{0,20}data|can't/i)],8:[T(/fashion|college|budget/i)],9:[T(/variation|one variable|change one|controlled/i)],10:[T(/not enough evidence|don't have enough|can't (confidently )?determine|cannot/i)]};
const REVIEW=new Set([1,2,8]);
if(!process.env.AI_API_KEY){console.log('NOT RUN: set AI_API_KEY (and optionally AI_MODEL) to run the evaluation.');process.exit(2)}
const out=[];for(const c of cases){let text='';try{text=(await callAI('coach',{...ctx,note:c.context},c.input)).answer}catch(e){out.push({c,r:'FAIL',why:'Request failed: '+e.code});continue}
const ok=checks[c.id].every(f=>f(text));out.push({c,r:ok?(REVIEW.has(c.id)?'REVIEW':'PASS'):'FAIL',why:text.slice(0,240)})}
const n=k=>out.filter(o=>o.r===k).length;console.log(`AI EVALUATION\n${out.length} cases\nPassed: ${n('PASS')}\nNeeds review: ${n('REVIEW')}\nFailed: ${n('FAIL')}\n`);
for(const o of out)console.log(`CASE ${o.c.id} — ${o.r}\n  Input: ${o.c.input}\n  Response: ${o.why}\n`);
process.exit(n('FAIL')?1:0)
