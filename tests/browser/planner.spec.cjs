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
