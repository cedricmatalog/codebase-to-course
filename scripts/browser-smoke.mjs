import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';
const fixtureRoot = resolve(process.argv[2] || '');

if (!process.argv[2]) throw new Error('Usage: node scripts/browser-smoke.mjs <course-fixture-directory>');
await stat(fixtureRoot);

const mimeTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8']
]);

const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
    const filePath = resolve(fixtureRoot, relative);
    if (filePath !== fixtureRoot && !filePath.startsWith(fixtureRoot + sep)) throw new Error('Invalid path');
    const content = await readFile(filePath);
    response.writeHead(200, { 'content-type': mimeTypes.get(extname(filePath)) || 'application/octet-stream' });
    response.end(content);
  } catch (_) {
    response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    response.end('Not found');
  }
});

await new Promise((resolveListening, reject) => {
  server.once('error', reject);
  server.listen(0, '127.0.0.1', resolveListening);
});
const address = server.address();
const baseUrl = `http://127.0.0.1:${address.port}`;
const browser = await chromium.launch({ headless: true });
const results = { desktop: {}, file: {}, mobile: {}, recovery: {}, screenshots: {} };

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function waitForScroll(page) {
  await page.waitForTimeout(900);
}

try {
  const desktopContext = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const desktop = await desktopContext.newPage();
  const desktopErrors = [];
  desktop.on('pageerror', error => desktopErrors.push(error.message));
  await desktop.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  await desktop.waitForTimeout(150);

  const structure = await desktop.evaluate(() => {
    function luminance(rgb) {
      const channels = rgb.slice(0, 3).map(value => value / 255).map(value => value <= 0.04045 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4));
      return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
    }
    function parseColor(value) {
      const match = value && value.match(/rgba?\((\d+(?:\.\d+)?)[, ]+(\d+(?:\.\d+)?)[, ]+(\d+(?:\.\d+)?)(?:[, /]+(\d*\.?\d+))?\)/);
      return match ? [Number(match[1]), Number(match[2]), Number(match[3]), match[4] === undefined ? 1 : Number(match[4])] : null;
    }
    function backgroundFor(element) {
      let current = element;
      while (current) {
        const parsed = parseColor(getComputedStyle(current).backgroundColor);
        if (parsed && parsed[3] >= 0.95) return parsed;
        current = current.parentElement;
      }
      return [255, 255, 255, 1];
    }
    const contrastViolations = [];
    document.querySelectorAll('body *').forEach(element => {
      if (element.closest('[aria-hidden="true"], [hidden]')) return;
      if (!Array.from(element.childNodes).some(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim())) return;
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      if (style.display === 'none' || style.visibility === 'hidden' || rect.width === 0 || rect.height === 0) return;
      const foreground = parseColor(style.color);
      const background = backgroundFor(element);
      if (!foreground || foreground[3] < 0.95) return;
      const light = Math.max(luminance(foreground), luminance(background));
      const dark = Math.min(luminance(foreground), luminance(background));
      const ratio = (light + 0.05) / (dark + 0.05);
      const fontSize = Number.parseFloat(style.fontSize);
      const fontWeight = Number.parseInt(style.fontWeight, 10) || 400;
      const large = fontSize >= 24 || (fontSize >= 18.66 && fontWeight >= 700);
      const required = large ? 3 : 4.5;
      if (ratio + 0.01 < required) contrastViolations.push({ element: element.className || element.tagName, text: element.textContent.trim().slice(0, 60), ratio: Number(ratio.toFixed(2)), required });
    });
    const ids = Array.from(document.querySelectorAll('[id]'), element => element.id);
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
    const emptyButtons = Array.from(document.querySelectorAll('button')).filter(button => !(button.getAttribute('aria-label') || button.textContent.trim())).length;
    return {
      title: document.title,
      h1: document.querySelectorAll('h1').length,
      modules: document.querySelectorAll('.module').length,
      dots: document.querySelectorAll('.nav-dot').length,
      duplicates,
      emptyButtons,
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      legacyControls: document.querySelectorAll('div[role="button"], span[role="button"]').length,
      contrastViolations,
      dotsHidden: Array.from(document.querySelectorAll('.nav-dot')).every(dot => dot.getClientRects().length === 0),
      progressHeight: document.querySelector('#progress-bar').getBoundingClientRect().height,
      optionalLabels: Array.from(document.querySelectorAll('.practice-extra > summary'), summary => summary.textContent.trim()),
      readableType: ['.activity-instruction', '.btn', '.translation-code'].every(selector => Number.parseFloat(getComputedStyle(document.querySelector(selector)).fontSize) >= 14),
      csp: document.querySelector('meta[http-equiv="Content-Security-Policy"]')?.content || ''
    };
  });
  assert(structure.title === 'Inside Codebase to Course', 'Course title was not customized.');
  assert(structure.h1 === 1, `Expected one page h1, found ${structure.h1}.`);
  assert(structure.modules === 4 && structure.dots === 4, 'Module and nav counts do not match.');
  assert(structure.duplicates.length === 0, `Duplicate IDs: ${structure.duplicates.join(', ')}`);
  assert(structure.emptyButtons === 0, 'One or more buttons have no accessible name.');
  assert(structure.legacyControls === 0, 'Fixture still depends on div/span controls.');
  assert(structure.contrastViolations.length === 0, `Text contrast violations: ${JSON.stringify(structure.contrastViolations.slice(0, 8))}`);
  assert(structure.overflow <= 0, `Desktop page overflows by ${structure.overflow}px.`);
  assert(structure.dotsHidden, 'Module dots should defer direct choices to the searchable Contents panel.');
  assert(structure.progressHeight >= 4, 'Course progress is too visually subtle.');
  assert(structure.optionalLabels.length === 4 && structure.optionalLabels.every(label => label.startsWith('Optional · ') && label.length > 18), 'Optional practice labels do not describe their outcome.');
  assert(structure.readableType, 'Instruction, control, or code text fell below the readable type floor.');
  assert(structure.csp.includes("script-src 'self'") && structure.csp.includes("object-src 'none'") && structure.csp.includes("connect-src 'none'"), 'Course shell is missing its restrictive content security policy.');

  assert(await desktop.evaluate(() => document.activeElement === document.body), 'Initialization moved focus away from the page start.');
  await desktop.keyboard.press('Tab');
  assert(await desktop.locator('.skip-link').evaluate(link => link === document.activeElement), 'The skip link is not the first keyboard stop.');
  await desktop.evaluate(() => document.activeElement && document.activeElement.blur());

  await desktop.locator('#outline-toggle').click();
  assert(await desktop.locator('#course-outline').isVisible(), 'Contents did not open.');
  assert(await desktop.locator('.outline-link').count() === 4, 'Contents did not list every module.');
  await desktop.locator('#outline-search').fill('data');
  assert(await desktop.locator('.outline-link:visible').count() === 1, 'Contents search did not filter modules.');
  await desktop.locator('#outline-close').click();

  await desktop.locator('#help-toggle').click();
  assert(await desktop.locator('#course-help').isVisible(), 'Help dialog did not open.');
  await desktop.locator('#restart-course').click();
  assert((await desktop.locator('#restart-course').textContent()).includes('Confirm restart'), 'Course restart did not preview the destructive consequence.');
  await desktop.keyboard.press('Escape');
  assert(!(await desktop.locator('#course-help').isVisible()), 'Help dialog did not close with Escape.');

  const term = desktop.locator('.term').first();
  await term.focus();
  await desktop.keyboard.press('Enter');
  assert(await term.getAttribute('aria-expanded') === 'true', 'Glossary term did not open with keyboard.');
  await desktop.keyboard.press('Escape');
  assert(await term.getAttribute('aria-expanded') === 'false', 'Glossary term did not close with Escape.');

  await desktop.evaluate(() => document.activeElement && document.activeElement.blur());
  await desktop.keyboard.press('Home');
  await waitForScroll(desktop);
  const homeState = await desktop.evaluate(() => ({
    status: document.querySelector('#nav-status')?.textContent || '',
    scrollY: window.scrollY,
    active: document.activeElement?.id || document.activeElement?.tagName || ''
  }));
  await desktop.keyboard.press('j');
  await waitForScroll(desktop);
  const shortcutState = await desktop.evaluate(() => ({
    status: document.querySelector('#nav-status')?.textContent || '',
    scrollY: window.scrollY,
    active: document.activeElement?.id || document.activeElement?.tagName || ''
  }));
  assert(shortcutState.status.includes('Trace the first request'), `J shortcut did not update current module status: home=${JSON.stringify(homeState)}, afterJ=${JSON.stringify(shortcutState)}`);

  for (const module of await desktop.locator('.module').all()) {
    await module.scrollIntoViewIfNeeded();
    await desktop.waitForTimeout(120);
  }
  await desktop.locator('#course-overview').evaluate(element => element.scrollIntoView({ block: 'start' }));
  await waitForScroll(desktop);
  await desktop.mouse.move(0, 0);
  await desktop.keyboard.press('Escape');
  assert(await desktop.locator('.term-tooltip.visible').count() === 0, 'Glossary tooltip remained visible after dismissal.');
  const desktopScreenshot = join(fixtureRoot, 'desktop-smoke.png');
  await desktop.screenshot({ path: desktopScreenshot, fullPage: true });
  results.screenshots.desktop = desktopScreenshot;

  const quiz = desktop.locator('#quiz-module4');
  await quiz.locator('xpath=ancestor::details[1]/summary').click();
  await quiz.scrollIntoViewIfNeeded();
  assert(await quiz.locator('.quiz-check-btn').isDisabled(), 'Quiz Check should stay disabled until an answer is selected.');
  await quiz.locator('.quiz-option[data-value="engine"]').click();
  await quiz.locator('.quiz-check-btn').click();
  assert((await quiz.locator('.quiz-feedback').textContent()).includes('Exactly'), 'Quiz success feedback is missing.');
  assert(await quiz.locator('.quiz-check-btn').isDisabled(), 'Completed quiz did not disable Check.');
  await quiz.locator('.quiz-reset-btn').click();
  assert(!(await quiz.locator('.quiz-option').first().isDisabled()), 'Quiz reset did not restore options.');

  const chat = desktop.locator('#chat-module2');
  await chat.scrollIntoViewIfNeeded();
  assert((await chat.locator('.chat-empty').textContent()).includes('Watch the exchange unfold'), 'Chat lacks a meaningful initial state.');
  await chat.locator('.chat-all-btn').click();
  await desktop.waitForTimeout(60);
  assert(await chat.locator('.chat-all-btn').getAttribute('aria-pressed') === 'true', 'Play all did not enter a controllable playing state.');
  await chat.locator('.chat-all-btn').click();
  assert(await chat.locator('.chat-all-btn').getAttribute('aria-pressed') === 'false', 'Play all could not pause.');
  await chat.locator('.chat-next-btn').click();
  await desktop.waitForTimeout(750);
  assert(await chat.locator('.chat-message:not([hidden])').count() >= 1, 'Next message did not reveal chat content.');

  const flow = desktop.locator('.flow-animation').first();
  await flow.scrollIntoViewIfNeeded();
  for (let index = 0; index < 3; index += 1) await flow.locator('.flow-next-btn').click();
  assert(await flow.locator('.flow-history li').count() === 3, 'Flow does not preserve completed-step history.');
  assert(await flow.locator('.flow-next-btn').isDisabled(), 'Completed flow remains actionable.');

  const dnd = desktop.locator('#dnd-module3');
  await dnd.locator('xpath=ancestor::details[1]/summary').click();
  const chips = dnd.locator('.dnd-chip');
  const targets = dnd.locator('.dnd-zone-target');
  assert(await targets.nth(0).isDisabled(), 'An empty destination allowed an unproductive first click.');
  assert(await dnd.locator('.dnd-check-btn').isDisabled(), 'Matching Check should stay disabled until every item is placed.');
  await chips.nth(0).click();
  assert(!(await targets.nth(0).isDisabled()), 'Selecting an item did not enable its destinations.');
  await targets.nth(0).click();
  await chips.nth(1).click();
  await targets.nth(1).click();
  await dnd.locator('.dnd-check-btn').click();
  assert((await dnd.locator('.dnd-feedback').textContent()).includes('All 2 matches are correct'), 'Select/place matching did not complete successfully.');

  const architecture = desktop.locator('.arch-diagram').first();
  await architecture.locator('xpath=ancestor::details[1]/summary').click();
  await architecture.locator('.arch-component').nth(1).click();
  assert((await architecture.locator('.arch-description').textContent()).includes('saved progress'), 'Architecture description did not update.');

  const layerDemo = desktop.locator('.layer-demo');
  await layerDemo.locator('xpath=ancestor::details[1]/summary').click();
  await layerDemo.locator('.layer-tab').nth(1).click();
  assert(await layerDemo.locator('#layer-m4-css').isVisible(), 'Layer tabs did not reveal the selected panel.');
  assert(await layerDemo.locator('.layer-tab').nth(1).getAttribute('aria-selected') === 'true', 'Layer tab state was not announced.');

  const bug = desktop.locator('.bug-challenge');
  await bug.locator('.bug-target').click();
  assert((await bug.locator('.bug-feedback').textContent()).includes('Found it'), 'Bug challenge did not provide success feedback.');

  await desktop.locator('#course-complete').scrollIntoViewIfNeeded();
  await desktop.locator('#copy-next-prompt').click();
  await desktop.waitForFunction(() => (document.querySelector('#copy-status')?.textContent || '').length > 10);
  assert((await desktop.locator('#copy-status').textContent()).length > 10, 'Copy action did not report success or recovery guidance.');
  results.desktop = { ...structure, pageErrors: desktopErrors };
  assert(desktopErrors.length === 0, `Desktop page errors: ${desktopErrors.join('; ')}`);

  const savedState = { location: 'module-3', title: 'Module 3 of 4 · Follow data and decisions', percent: 58, completed: false, savedAt: Date.now() };
  await desktop.evaluate(state => localStorage.setItem('codebase-to-course:Inside Codebase to Course', JSON.stringify(state)), savedState);
  await desktop.reload({ waitUntil: 'domcontentloaded' });
  assert(await desktop.locator('#resume-banner').isVisible(), 'Saved progress did not offer Resume.');
  await desktop.locator('#resume-course').click();
  await waitForScroll(desktop);
  assert((await desktop.locator('#nav-status').textContent()).includes('Follow data and decisions'), 'Resume did not return to the saved module.');
  await desktopContext.close();

  const fileContext = await browser.newContext({ viewport: { width: 1024, height: 768 } });
  const filePage = await fileContext.newPage();
  const fileErrors = [];
  filePage.on('pageerror', error => fileErrors.push(error.message));
  await filePage.goto(pathToFileURL(join(fixtureRoot, 'index.html')).href, { waitUntil: 'domcontentloaded' });
  await filePage.waitForTimeout(150);
  assert(await filePage.title() === 'Inside Codebase to Course', 'Direct file launch lost the customized title.');
  assert(await filePage.locator('.module').count() === 4, 'Direct file launch lost manifest-listed modules.');
  assert((await filePage.locator('.course-provenance').textContent()).includes('https://github.com/example/codebase-to-course'), 'Direct file launch lost visible provenance.');
  await filePage.locator('#outline-toggle').click();
  assert(await filePage.locator('#course-outline').isVisible(), 'Contents did not work from file://.');
  assert(await filePage.locator('.outline-link').count() === 4, 'Direct file Contents did not list every module.');
  assert(fileErrors.length === 0, `Direct file page errors: ${fileErrors.join('; ')}`);
  results.file = { protocol: new URL(filePage.url()).protocol, modules: 4, outlineLinks: 4, pageErrors: fileErrors };
  await fileContext.close();

  const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const mobile = await mobileContext.newPage();
  const mobileErrors = [];
  mobile.on('pageerror', error => mobileErrors.push(error.message));
  await mobile.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  await mobile.locator('#module-1').evaluate(element => element.scrollIntoView({ block: 'start' }));
  await mobile.waitForTimeout(120);
  const mobileLayout = await mobile.evaluate(() => {
    const nav = document.querySelector('.nav').getBoundingClientRect();
    const module = document.querySelector('#module-1').getBoundingClientRect();
    const controls = Array.from(document.querySelectorAll('.nav-action'), element => element.getBoundingClientRect());
    const status = document.querySelector('#nav-status');
    const title = document.querySelector('.nav-title');
    const labels = Array.from(document.querySelectorAll('#outline-toggle span'));
    return {
      width: window.innerWidth,
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      navBottom: nav.bottom,
      moduleTop: module.top,
      statusText: status.textContent.trim(),
      statusClipped: status.scrollWidth > status.clientWidth,
      titleVisible: title.getClientRects().length > 0,
      actionLabelsVisible: labels.every(label => label.getClientRects().length > 0),
      controls: controls.map(rect => ({ left: rect.left, right: rect.right, width: rect.width, height: rect.height }))
    };
  });
  assert(mobileLayout.overflow <= 0, `Mobile page overflows by ${mobileLayout.overflow}px.`);
  assert(!mobileLayout.statusClipped && mobileLayout.statusText === '1/4 · Trace the first request', 'Mobile navigation clips or obscures the current module context.');
  assert(!mobileLayout.titleVisible, 'Mobile navigation should prioritize full current-module context over the redundant course title.');
  assert(mobileLayout.actionLabelsVisible, 'Mobile navigation hides the Contents label.');
  assert(mobileLayout.moduleTop >= mobileLayout.navBottom - 1, `Fixed nav overlaps module content: module ${mobileLayout.moduleTop}, nav ${mobileLayout.navBottom}.`);
  assert(mobileLayout.controls.every(control => control.width >= 44 && control.height >= 44 && control.left >= 0 && control.right <= 390), `Mobile nav controls are clipped or undersized: ${JSON.stringify(mobileLayout.controls)}`);
  await mobile.locator('#outline-toggle').click();
  assert(await mobile.locator('.outline-link').count() === 4, 'Mobile Contents lost module destinations.');
  await mobile.locator('#outline-close').click();
  const mobileScreenshot = join(fixtureRoot, 'mobile-smoke.png');
  await mobile.screenshot({ path: mobileScreenshot, fullPage: true });
  results.screenshots.mobile = mobileScreenshot;
  results.mobile = { ...mobileLayout, pageErrors: mobileErrors };
  assert(mobileErrors.length === 0, `Mobile page errors: ${mobileErrors.join('; ')}`);
  await mobileContext.close();

  const recoveryContext = await browser.newContext({ viewport: { width: 900, height: 700 } });
  const recovery = await recoveryContext.newPage();
  const recoveryErrors = [];
  recovery.on('pageerror', error => recoveryErrors.push(error.message));
  await recovery.goto(baseUrl + '/bad-flow.html', { waitUntil: 'domcontentloaded' });
  const recoveryText = await recovery.locator('.flow-error[role="alert"]').textContent();
  assert(recoveryText.includes('step list is incomplete') && recoveryText.includes('rebuild the course'), 'Malformed flow data did not show plain-language recovery guidance.');
  assert(await recovery.locator('.flow-next-btn').isDisabled(), 'Malformed flow left controls active.');
  assert(recoveryErrors.length === 0, `Malformed flow caused page errors: ${recoveryErrors.join('; ')}`);
  results.recovery = { message: recoveryText.trim(), pageErrors: recoveryErrors };
  await recoveryContext.close();

  process.stdout.write(JSON.stringify(results, null, 2) + '\n');
} finally {
  await browser.close();
  await new Promise(resolveClose => server.close(resolveClose));
}
