const {test,expect}=require('@playwright/test');
const origin='http://127.0.0.1:8000';
const owner='781a12d6-fbc5-40a3-8368-32164823cd5f';
const key='daily-checklist:v2';
const task={id:'cloud-test',title:'Cloud test task',category:'Work',priority:'Normal',done:false};
const state={version:2,tasks:[task],archive:[],seen:[task.id]};
test.use({serviceWorkers:'block'});
test('owner signs in, uploads, reloads, refreshes and disconnects without losing tasks',async({page})=>{
 let row=null,logins=0,refreshes=0;
 await page.addInitScript(({key,state})=>{if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(state))},{key,state});
 await page.route('**/tasks.json?*',r=>r.fulfill({json:[task]}));
 await page.route('https://jhcuvechtcrobcepassp.supabase.co/**',async r=>{
  const u=new URL(r.request().url()),method=r.request().method();
  const headers={'access-control-allow-origin':'*','access-control-allow-headers':'*','access-control-allow-methods':'GET,POST,PATCH,OPTIONS'};
  const send=(json,status=200)=>r.fulfill({status,headers,json});
  if(method==='OPTIONS')return r.fulfill({status:204,headers});
  if(u.pathname==='/auth/v1/token'){const refresh=u.searchParams.get('grant_type')==='refresh_token';if(refresh)refreshes++;else logins++;return send({user:{id:owner},access_token:'test-access',refresh_token:'test-refresh',expires_at:Math.floor(Date.now()/1000)+3600})}
  if(u.pathname==='/auth/v1/logout')return r.fulfill({status:204,headers});
  if(method==='GET')return send(row?[row]:[]);
  if(method==='POST'){row={revision:0,state:r.request().postDataJSON().state};return send([row],201)}
  if(method==='PATCH'){if(u.searchParams.get('revision')!=='eq.'+row.revision)return send([]);row={revision:row.revision+1,state:r.request().postDataJSON().state};return send([row])}
  return send({},400);
 });
 page.on('dialog',d=>d.accept());
 await page.goto(origin);
 await expect(page.locator('#total')).toHaveText('1');
 await page.locator('#profile').click();
 await expect(page.locator('#cloud-account')).toBeFocused();
 await page.locator('#cloud-email').fill('owner@example.com');
 await page.locator('#cloud-password').fill('test-password');
 await page.locator('#cloud-login button').click();
 await expect(page.locator('#cloud-status')).toHaveText('Cloud synchronized.');
 await expect(page.locator('#profile-state')).toHaveText('Owner account signed in');
 expect(logins).toBe(1);
 expect(row.state.tasks[0].id).toBe(task.id);
 await page.reload();
 await expect(page.locator('#cloud-login')).toHaveJSProperty('hidden',true);
 await expect(page.locator('#cloud-status')).toHaveText('Cloud synchronized.');
 expect(logins).toBe(1);
 await page.evaluate(k=>{const s=JSON.parse(localStorage.getItem(k+':cloud-session'));s.expires_at=0;localStorage.setItem(k+':cloud-session',JSON.stringify(s))},key);
 await page.reload();
 await expect.poll(()=>refreshes).toBe(1);
 await expect(page.locator('#cloud-status')).toHaveText('Cloud synchronized.');
 await page.locator('#manage summary').click();
 await page.locator('#cloud-out').click();
 await expect(page.locator('#cloud-login')).toBeVisible();
 await expect(page.locator('#total')).toHaveText('1');
 expect(await page.evaluate(k=>localStorage.getItem(k+':cloud-session'),key)).toBeNull();
});
