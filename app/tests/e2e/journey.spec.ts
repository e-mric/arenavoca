import {test,expect,type Page} from '@playwright/test';
async function ready(page:Page){await page.goto('/');await expect(page.locator('#start')).toBeEnabled();await expect(page.locator('#xr-status')).not.toHaveText('');}
async function pass(page:Page){await page.locator('#start').click();await page.locator('video').evaluate(v=>{v.currentTime=13;});await expect(page.locator('#phrase-card')).toBeVisible();}
test('Watch, Explore, trace, Listen, Save, Back and browser reopening',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await ready(page);await pass(page);await page.locator('#play').click();const position=await page.locator('video').evaluate(v=>v.currentTime);
 await page.locator('#explore').click();await expect(page.locator('#explore-view')).toBeVisible();
 await page.locator('#trace-start').click();const box=(await page.locator('#trace-diagram').boundingBox())!;
 const from={x:box.x+box.width*(.04+.92*.32),y:box.y+box.height*(.08+.84*.70)};
 const to={x:box.x+box.width*(.04+.92*.65),y:box.y+box.height*(.08+.84*.35)};
 await page.mouse.move(from.x,from.y);await page.mouse.down();await page.mouse.move(to.x,to.y,{steps:25});await page.mouse.up();await expect(page.locator('#chunks .revealed')).toHaveCount(3);
 await page.locator('#explore-listen').click();await expect.poll(()=>page.locator('video').evaluate(v=>v.volume)).toBe(.22);
 await page.locator('#explore-save').click();await expect(page.locator('#explore-save')).toHaveText('Saved ✓');
 await page.screenshot({path:'../docs/prototype-explore.png',fullPage:true});
 await page.locator('#back').click();await expect(page.locator('#explore-view')).toBeHidden();expect(await page.locator('video').evaluate(v=>v.paused)).toBe(true);expect(await page.locator('video').evaluate(v=>v.currentTime)).toBeCloseTo(position,1);expect(await page.locator('video').evaluate(v=>v.volume)).toBe(1);
 await page.screenshot({path:'../docs/prototype-watch.png',fullPage:true});
 await page.reload();await expect(page.locator('#start')).toBeEnabled();await page.locator('#resume-saved').click();await expect(page.locator('#saved-count')).toHaveText('1');await page.locator('#library').click();await expect(page.locator('#library-status')).toHaveText('Saved on this device.');expect(errors).toEqual([]);
});
test('Replay provides the complete explanation and playing intent returns',async({page})=>{
 await ready(page);await pass(page);await page.locator('#explore').click();await page.locator('#replay').click();await expect(page.locator('#chunks .revealed')).toHaveCount(3);await page.locator('#back').click();expect(await page.locator('video').evaluate(v=>v.paused)).toBe(false);
});
test('muted viewing, hidden prompts and ignoring all learning still finishes offline',async({page,context})=>{
 await ready(page);await page.locator('#start').click();await page.locator('#mute').click();await page.locator('#hide-prompts').click();await context.setOffline(true);await page.locator('video').evaluate(v=>{v.currentTime=13;});await expect(page.locator('#phrase-card')).toBeHidden();expect(await page.locator('video').evaluate(v=>v.volume)).toBe(0);await page.locator('video').evaluate(v=>{v.currentTime=29.7;});await expect(page.locator('#completed')).toBeVisible();await context.setOffline(false);
});
test('failed durable Save stays unsaved and reports a retry',async({page})=>{
 await page.addInitScript(()=>{Storage.prototype.setItem=()=>{throw new DOMException('Quota exceeded','QuotaExceededError');};});await ready(page);await pass(page);await page.locator('#save').click();await expect(page.locator('#save')).toHaveText('Save phrase');await expect(page.locator('#status')).toContainText('Could not save');
});
test('failed media offers Retry; unavailable pronunciation does not block watching',async({page})=>{
 await page.route('**/media/match.mp4',route=>route.fulfill({status:503,body:'offline'}));await page.goto('/');await expect(page.locator('#retry')).toBeVisible();await expect(page.locator('#start')).toBeDisabled();await page.unroute('**/media/match.mp4');await page.route('**/audio/pass-es.mp3',route=>route.fulfill({status:503,body:'unavailable'}));await page.locator('#retry').click();await expect(page.locator('#start')).toBeEnabled();await pass(page);await page.locator('#listen').click();await expect(page.locator('#status')).toContainText('Pronunciation could not load');expect(await page.locator('video').evaluate(v=>v.paused)).toBe(false);
});
test('narrow browser layout keeps controls reachable',async({page})=>{await page.setViewportSize({width:390,height:844});await ready(page);await pass(page);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.locator('#explore').click();await expect(page.locator('#back')).toBeVisible();});
