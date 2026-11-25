import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const plan=JSON.parse(readFileSync(new URL('../tasks.json',import.meta.url),'utf8'));
const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
function harness(){
 const storage=new Map(), nodes=new Map();
 const node=()=>({value:'',textContent:'',disabled:false,children:[],append(...x){this.children.push(...x)},replaceChildren(){this.children=[]},setAttribute(){},classList:{toggle(){return false}},querySelector(){return node()},reset(){},focus(){}});
 const document={getElementById(id){if(!nodes.has(id))nodes.set(id,node());return nodes.get(id)},createElement:node,querySelectorAll(){return []},body:node()};
 const context=vm.createContext({document,localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v)},fetch:async()=>({ok:true,text:async()=>JSON.stringify(plan)}),console,crypto:{randomUUID:()=> 'local-test'},confirm:()=>true});
 vm.runInContext(script,context);
 return {context,storage,nodes,run:code=>vm.runInContext(code,context)};
}
test('static plan follows schema and has unique identifiers',()=>{assert.ok(plan.length<=500);assert.equal(new Set(plan.map(x=>x.id)).size,plan.length);for(const x of plan){assert.ok(typeof x.id==='string'&&x.id);assert.ok(typeof x.title==='string'&&x.title.trim()&&x.title.length<=240);assert.ok(['Work','Content','Personal','Finance','Business','Other'].includes(x.category));assert.ok(['High','Normal','Low'].includes(x.priority));assert.equal(x.done,false)}});
test('startup loads plan and refresh preserves completion and deleted IDs',async()=>{const h=harness();await h.run('refreshPlan()');assert.equal(h.run('tasks.length'),plan.length);h.run('tasks[0].done=true; save()');await h.run('refreshPlan()');assert.equal(h.run('tasks[0].done'),true);h.run('seen.add(tasks[0].id);tasks.shift();save()');await h.run('refreshPlan()');assert.equal(h.run('tasks.length'),plan.length-1)});
test('invalid and duplicate plan records rejected',async()=>{const h=harness();await h.run('refreshPlan()');assert.throws(()=>h.run("decode('[{}]')"));assert.throws(()=>h.run('decode(JSON.stringify([tasks[0],tasks[0]]))'))});
