'use strict';
/* Owner-only cloud backup. Local storage remains the working copy. */
(function(root){
const URL_BASE='https://jhcuvechtcrobcepassp.supabase.co';
const KEY='sb_publishable_hBSzM_41GB5upUqYXjTmNw_r_5kht45';
const OWNER='781a12d6-fbc5-40a3-8368-32164823cd5f';
const LOCAL='daily-checklist:v2', META=LOCAL+':cloud-meta', SESSION=LOCAL+':cloud-session';
function decision(local,remote,base){
 if(local===remote)return 'equal';
 if(base===null)return 'conflict';
 if(remote===base)return 'push';
 if(local===base)return 'pull';
 return 'conflict';
}
if(typeof module==='object'&&module.exports){module.exports={decision};return}
const C=root.PlannerCore, $=id=>document.getElementById(id);
let session=null,busy=false,connected=false;
const lockName=LOCAL+':cloud-lock';
function exclusive(fn){if(!navigator.locks){status('Cloud requires a browser supporting Web Locks. Local data retained.');return Promise.resolve()}return navigator.locks.request(lockName,fn).catch(()=>status('Cloud session unavailable. Local copy retained.'))}
function reloadSession(){try{session=JSON.parse(localStorage.getItem(SESSION)||'null')}catch{session=null}connected=!!(typeof session?.access_token==='string'&&typeof session?.refresh_token==='string'&&Number.isFinite(session?.expires_at));if(!connected){session=null;localStorage.removeItem(SESSION)}controls()}
function clearSession(){localStorage.removeItem(SESSION);session=null;connected=false;controls()}
const status=s=>{$('cloud-status').textContent=s};
const canonical=s=>JSON.stringify(C.decode(s));
function snapshot(){const raw=localStorage.getItem(LOCAL);if(!raw)throw Error('No saved checklist.');return canonical(raw)}
function meta(){try{return JSON.parse(localStorage.getItem(META)||'null')}catch{return null}}
function setMeta(row){localStorage.setItem(META,JSON.stringify({revision:row.revision,base:canonical(row.state)}))}
function controls(){ $('cloud-login').hidden=connected;for(const id of ['cloud-now','cloud-out','cloud-pull'])$(id).hidden=!connected }
async function request(path,{method='GET',body,token,prefer}={}){
 const headers={apikey:KEY,'Content-Type':'application/json'};
 if(token)headers.Authorization='Bearer '+token;
 if(prefer)headers.Prefer=prefer;
 const res=await fetch(URL_BASE+path,{method,headers,body:body===undefined?undefined:JSON.stringify(body),cache:'no-store',signal:AbortSignal.timeout(15000)});
 if(!res.ok){const error=Error('Cloud request failed ('+res.status+').');error.status=res.status;try{error.code=(await res.json()).error_code}catch{}throw error}
 return res.status===204?null:res.json();
}
function storeSession(s){if(s.user?.id!==OWNER||!s.access_token||!s.refresh_token)throw Error('Owner account required.');session={access_token:s.access_token,refresh_token:s.refresh_token,expires_at:s.expires_at||Math.floor(Date.now()/1000)+s.expires_in};localStorage.setItem(SESSION,JSON.stringify(session));connected=true;controls()}
async function token(){if(!session)throw Error('Sign in first.');if(session.expires_at>Date.now()/1000+90)return session.access_token;let s;try{s=await request('/auth/v1/token?grant_type=refresh_token',{method:'POST',body:{refresh_token:session.refresh_token}})}catch(e){if([401,403].includes(e.status)||['refresh_token_not_found','refresh_token_already_used','session_not_found','session_expired','user_not_found'].includes(e.code))clearSession();throw e}storeSession(s);return session.access_token}
const rowPath='/rest/v1/planner_state?user_id=eq.'+OWNER;
async function read(){const rows=await request(rowPath+'&select=revision,state',{token:await token()});if(!Array.isArray(rows)||rows.length>1)throw Error('Unexpected cloud data.');if(rows[0]){canonical(rows[0].state);if(!Number.isSafeInteger(rows[0].revision))throw Error('Invalid revision.')}return rows[0]||null}
async function write(local,row){const data=await request(row?rowPath+'&revision=eq.'+row.revision:'/rest/v1/planner_state',{method:row?'PATCH':'POST',body:row?{state:JSON.parse(local)}:{user_id:OWNER,state:JSON.parse(local)},token:await token(),prefer:'return=representation'});if(!Array.isArray(data)||data.length!==1)throw Error('Cloud changed during sync. Try again.');setMeta(data[0])}
function restore(row,expected){if(snapshot()!==expected)throw Error('Local checklist changed. Retry.');localStorage.setItem(LOCAL+':cloud-recovery:'+Date.now(),expected);localStorage.setItem(LOCAL,canonical(row.state));setMeta(row);location.reload()}
function progress(raw){const s=C.decode(raw),today=C.day(),d=new Date();d.setDate(d.getDate()-6);const week=C.day(d);const done=[...s.tasks,...s.archive].filter(t=>t.done&&t.completedDay);$('cloud-progress').textContent='Completed today: '+done.filter(t=>t.completedDay===today).length+' · Last 7 days: '+done.filter(t=>t.completedDay>=week&&t.completedDay<=today).length+' · This month: '+done.filter(t=>t.completedDay.startsWith(today.slice(0,7))&&t.completedDay<=today).length}
async function sync(manual=false,forcePull=false){return exclusive(async()=>{reloadSession();return syncLocked(manual,forcePull)})}
async function syncLocked(manual=false,forcePull=false){
 if(!connected||busy)return;busy=true;
 try{const local=snapshot();progress(local);const row=await read(),m=meta();
 if(!row){if(forcePull){status('No cloud copy exists. Local checklist retained.');return}if(!manual||!confirm('Upload this browser checklist, including completion history, to your private cloud account?')){status('Cloud empty. Select Sync now to upload this browser.');return}await write(local,null);status('Cloud synchronized.');return}
 const remote=canonical(row.state),action=decision(local,remote,m?.base??null);
 if(forcePull){if(confirm('Restore cloud checklist? Current local copy will be retained as a recovery backup.'))restore(row,local);return}
 if(action==='equal'){setMeta(row);status('Cloud synchronized.');return}
 if(action==='push'){await write(local,row);status('Cloud synchronized.');return}
 if(action==='pull'){if(document.getElementById('cancel-edit')?.hidden===false||document.getElementById('title')?.value){status('Cloud update available. Finish editing before synchronization.');return}restore(row,local);return}
 status('Different local and cloud copies. Export local backup, then choose Restore cloud copy. No data overwritten.');
 }catch(e){if(e.status===401||e.status===403||e.status===400){if(e.status===401||e.status===403){clearSession();status('Session expired or access denied. Sign in again. Local copy retained.');return}}status('Cloud sync paused: '+e.message+' Local copy retained.')}finally{busy=false}
}
$('cloud-login').onsubmit=async e=>{e.preventDefault();await exclusive(async()=>{reloadSession();if(busy||connected)return;busy=true;try{const s=await request('/auth/v1/token?grant_type=password',{method:'POST',body:{email:$('cloud-email').value,password:$('cloud-password').value}});storeSession(s);status('Signed in. Select Sync now to initialize.')}catch{status('Sign-in failed. Check owner credentials and connectivity.')}finally{$('cloud-password').value='';busy=false}if(connected)await syncLocked(true)});};
$('cloud-now').onclick=()=>sync(true);
$('cloud-pull').onclick=()=>sync(true,true);
$('cloud-out').onclick=async()=>exclusive(async()=>{reloadSession();if(busy)return;busy=true;try{if(session)await request('/auth/v1/logout?scope=local',{method:'POST',token:await token()})}catch{}finally{session=null;connected=false;localStorage.removeItem(SESSION);controls();status('Disconnected. Local checklist retained.');busy=false}});
try{reloadSession();progress(snapshot());if(connected)sync()}catch{status('Local storage unavailable.')}
setInterval(()=>{if(!document.hidden){try{progress(snapshot())}catch{}sync()}},30000);
window.addEventListener('storage',e=>{if(e.key===SESSION){try{reloadSession();if(!connected)status('Disconnected. Local checklist retained.')}catch{status('Session unavailable.')}}});
window.addEventListener('online',()=>sync());document.addEventListener('visibilitychange',()=>{if(!document.hidden)sync()});
})(globalThis);
