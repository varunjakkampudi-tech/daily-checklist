const {test,expect}=require('@playwright/test');
const origin='http://127.0.0.1:8000';
const fixture=[{id:'test-timesheet',title:'Submit timesheet',category:'Work',priority:'High',done:false}];
test.beforeEach(async({page})=>{
  await page.addInitScript(plan=>{if(!localStorage.getItem('daily-checklist:v2'))localStorage.setItem('daily-checklist:v2',JSON.stringify({version:2,tasks:plan,archive:[],seen:plan.map(t=>t.id)}))},fixture);
  await page.route('**/tasks.json?*',route=>route.fulfill({json:fixture}));
});
test('three tabs, completion, undo and persistence',async({page})=>{
  await page.goto(origin);await expect(page.locator('.tabs button')).toHaveText(['Pending','Completed','All']);
  await expect(page.locator('#total')).toHaveText('1');
  await page.getByRole('button',{name:'Complete Submit timesheet',exact:true}).click();
  await expect(page.locator('#done')).toHaveText('1');
  await page.getByRole('button',{name:'Undo',exact:true}).click();
  await expect(page.locator('#done')).toHaveText('0');
  await page.getByRole('button',{name:'Complete Submit timesheet',exact:true}).click();
  await page.reload();await expect(page.locator('#done')).toHaveText('1');
  await page.locator('[data-filter=done]').click();await expect(page.getByRole('button',{name:'Reopen Submit timesheet',exact:true})).toBeVisible();
  await page.locator('[data-filter=all]').click();await expect(page.getByRole('button',{name:'Reopen Submit timesheet',exact:true})).toBeVisible();
  await page.locator('#manage summary').click();await page.locator('#appearance').selectOption('dark');
  await page.reload();await expect(page.locator('body')).toHaveClass(/dark/);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('create task with notes, category and recurrence',async({page})=>{
  await page.goto(origin);await page.locator('#quick-add').click();
  await page.locator('#title').fill('Read documentation');await page.locator('#custom-category').fill('Learning');
  await page.locator('#notes').fill('Review API');await page.locator('#repeat').selectOption('weekly');
  await page.locator('#form button[type=submit]').click();
  await expect(page.getByRole('button',{name:'Complete Read documentation',exact:true})).toBeVisible();
  await expect(page.locator('.task-note')).toHaveText('Review API');
});
test('header date is local and visible',async({page})=>{
  await page.goto(origin);const date=await page.evaluate(()=>new Intl.DateTimeFormat('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(new Date()));
  await expect(page.locator('#today-date')).toHaveText(date);await expect(page.locator('#today-date')).toBeVisible();
});

test('add icon is centered in its wrapper',async({page})=>{
  await page.goto(origin);
  const button=await page.locator('#quick-add').boundingBox(),icon=await page.locator('#quick-add svg').boundingBox();
  expect(Math.abs(button.x+button.width/2-icon.x-icon.width/2)).toBeLessThanOrEqual(1);
  expect(Math.abs(button.y+button.height/2-icon.y-icon.height/2)).toBeLessThanOrEqual(1);
});
test('next day retains pending and completed tasks when a new plan arrives',async({page})=>{
  await page.goto(origin);
  await expect(page.locator('#total')).toHaveText('1');
  await page.evaluate(()=>localStorage.setItem('daily-checklist:v2',JSON.stringify({version:2,tasks:[{id:'test-timesheet',title:'Submit timesheet',category:'Work',priority:'High',done:true,completedDay:'2020-01-01'},{id:'old-pending',title:'Old pending task',category:'Personal',priority:'Normal',done:false}],archive:[],seen:['test-timesheet','old-pending']})));
  await page.unroute('**/tasks.json?*');
  await page.route('**/tasks.json?*',route=>route.fulfill({json:[...fixture,{id:'new-tomorrow',title:'New daily task',category:'Work',priority:'Normal',done:false}]}));
  await page.reload();
  await expect(page.locator('#total')).toHaveText('3');
  await expect(page.locator('#done')).toHaveText('1');
  await expect(page.locator('#pending')).toHaveText('2');
  await expect(page.getByRole('button',{name:'Complete Old pending task',exact:true})).toBeVisible();
  await expect(page.getByRole('button',{name:'Complete New daily task',exact:true})).toBeVisible();
  await expect(page.getByRole('button',{name:'Reopen Submit timesheet',exact:true})).toHaveCount(0);
  await page.locator('[data-filter=done]').click();
  await expect(page.getByRole('button',{name:'Reopen Submit timesheet',exact:true})).toBeVisible();
  await expect(page.locator('#list .task')).toHaveCount(1);
  await page.locator('[data-filter=all]').click();
  await expect(page.locator('#list .task')).toHaveCount(3);
});

test('premium summary and theme toggle persist',async({page})=>{
  await page.goto(origin);
  await expect(page.locator('#ring-count')).toHaveText('0 of 1');
  await expect(page.locator('#view-title')).toHaveText('Pending tasks (1)');
  await page.locator('#manage summary').click();
  await page.locator('#appearance').selectOption('light');
  await expect(page.locator('body')).not.toHaveClass(/dark/);
  await page.locator('#theme').click();
  await expect(page.locator('body')).toHaveClass(/dark/);
  await page.reload();
  await expect(page.locator('body')).toHaveClass(/dark/);
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content','#111b17');
  await page.locator('#theme').click();
  await expect(page.locator('body')).not.toHaveClass(/dark/);
  await page.locator('[data-filter=done]').click();
  await expect(page.locator('#view-title')).toHaveText('Completed tasks (0)');
});
test('both themes fit narrow mobile and desktop layouts',async({page})=>{
  await page.goto(origin);
  await page.locator('#manage summary').click();
  for(const theme of ['light','dark']){
    await page.locator('#appearance').selectOption(theme);
    for(const width of [320,390,1440]){
      await page.setViewportSize({width,height:900});
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    }
  }
});

test('settings shortcut and category labels work without extra tabs',async({page})=>{
  await page.goto(origin);
  await expect(page.locator('.tabs button')).toHaveCount(3);
  await expect(page.locator('.task-category')).toHaveText('Work');
  await page.getByRole('button',{name:'Settings',exact:true}).click();
  await expect(page.locator('#appearance')).toBeFocused();
  await expect(page.locator('#appearance')).toBeVisible();
});
