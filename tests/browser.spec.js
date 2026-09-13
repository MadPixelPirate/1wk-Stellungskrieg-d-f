import { test, expect } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { chapters, sources, quiz } from '../src/content.mjs';

async function paintInfo(page) {
  await expect(page.locator('#scene')).toHaveAttribute('data-ready', 'true');
  return page.locator('#scene canvas').evaluate(canvas => {
    const copy = document.createElement('canvas');
    copy.width = canvas.width;
    copy.height = canvas.height;
    const context = copy.getContext('2d');
    context.drawImage(canvas, 0, 0);
    const pixels = context.getImageData(0, 0, copy.width, copy.height).data;
    const colors = new Set();
    let painted = 0;
    let checksum = 0;
    let samples = 0;
    for (let index = 0; index < pixels.length; index += 64) {
      samples++;
      if (pixels[index + 3] > 0) {
        painted++;
        colors.add(`${pixels[index]},${pixels[index + 1]},${pixels[index + 2]}`);
      }
      checksum = (checksum * 31 + pixels[index] + pixels[index + 1] + pixels[index + 2] + pixels[index + 3]) >>> 0;
    }
    return { width: canvas.width, height: canvas.height, coverage: painted / samples, colors: colors.size, checksum };
  });
}

async function ready(page, path = '/?scoutTheme=light') {
  await page.goto(path);
  await expect(page.locator('#scene')).toHaveAttribute('data-ready', 'true');
  await expect(page.locator('#scene-fallback')).toBeHidden();
}

async function assertLayout(page) {
  const result = await page.evaluate(() => {
    const labels = [...document.querySelectorAll('.spatial-label:not([hidden])')];
    const overlaps = [];
    for (let first = 0; first < labels.length; first++) {
      for (let second = first + 1; second < labels.length; second++) {
        const firstRect = labels[first].getBoundingClientRect();
        const secondRect = labels[second].getBoundingClientRect();
        if (firstRect.left < secondRect.right && firstRect.right > secondRect.left && firstRect.top < secondRect.bottom && firstRect.bottom > secondRect.top) overlaps.push([labels[first].textContent, labels[second].textContent]);
      }
    }
    const controls = [...document.querySelectorAll('.scene-toolbar button, .site-header button, .story-navigation button')];
    const clippedControls = controls.filter(element => element.scrollWidth > element.clientWidth + 2).map(element => element.id);
    return { overflow: document.documentElement.scrollWidth > window.innerWidth, overlaps, clippedControls };
  });
  expect(result).toEqual({ overflow: false, overlaps: [], clippedControls: [] });
}

test('renders real 3D pixels, changes camera, and exposes model explanations', async ({ page }, testInfo) => {
  const problems = [];
  page.on('pageerror', error => problems.push(error.message));
  page.on('console', message => {
    if (message.type() === 'error' || /deprecated/i.test(message.text())) problems.push(message.text());
  });
  await ready(page);
  const map = await paintInfo(page);
  expect(map.width).toBeGreaterThan(250);
  expect(map.height).toBeGreaterThan(300);
  expect(map.coverage).toBeGreaterThan(0.2);
  expect(map.colors).toBeGreaterThan(30);
  await assertLayout(page);
  await page.screenshot({ path: testInfo.outputPath('map.png'), fullPage: true });
  await page.getByRole('button', { name: 'Gr\u00e4ben', exact: true }).click();
  await expect(page.locator('#scene')).toHaveAttribute('data-mode', 'trenches');
  const trench = await paintInfo(page);
  expect(trench.colors).toBeGreaterThan(60);
  expect(trench.checksum).not.toBe(map.checksum);
  await expect.poll(async () => (await paintInfo(page)).checksum).not.toBe(trench.checksum);
  await page.getByRole('button', { name: 'Bewegung pausieren', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Bewegung fortsetzen' })).toHaveAttribute('aria-pressed', 'true');
  const beforeZoom = (await paintInfo(page)).checksum;
  await page.getByRole('button', { name: 'Vergr\u00f6\u00dfern', exact: true }).click();
  await expect.poll(async () => (await paintInfo(page)).checksum).not.toBe(beforeZoom);
  await page.getByRole('button', { name: 'Ansicht zur\u00fccksetzen', exact: true }).click();
  await page.getByRole('button', { name: 'Draufsicht', exact: true }).click();
  await expect(page.locator('#top-view')).toHaveAttribute('aria-pressed', 'true');
  await assertLayout(page);
  await page.getByRole('button', { name: 'Ansicht zur\u00fccksetzen', exact: true }).click();
  await page.locator('.feature-label:visible').first().click();
  await expect(page.locator('#detail-dialog')).toBeVisible();
  await expect(page.locator('.feature-description')).not.toBeEmpty();
  await page.getByRole('button', { name: 'Schlie\u00dfen', exact: true }).click();
  await page.getByRole('button', { name: 'Grabenbegriffe', exact: true }).click();
  await expect(page.locator('#dialog-content .source-entry')).toHaveCount(4);
  await expect(page.locator('#dialog-content')).toContainText('Niemandsland');
  await page.getByRole('button', { name: 'Schlie\u00dfen', exact: true }).click();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: testInfo.outputPath('trenches.png'), fullPage: true });
  expect(problems).toEqual([]);
});

test('chapter navigation, deep links, history and sources stay in sync', async ({ page }) => {
  await ready(page);
  for (const [index, chapter] of chapters.entries()) {
    await page.locator(`#tab-${chapter.id}`).click();
    await expect(page.locator('#chapter-heading')).toHaveText(chapter.title);
    await expect(page.locator('#metric-value')).toHaveText(chapter.metric.value);
    await expect(page.locator('#scene')).toHaveAttribute('data-mode', chapter.scene);
    await expect(page.locator(`#tab-${chapter.id}`)).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('#chapter-citations button')).toHaveCount(chapter.sourceIds.length);
    await expect(page.locator('#current-page')).toHaveText(String(index + 1).padStart(2, '0'));
    await assertLayout(page);
  }
  await page.goBack();
  await expect(page.locator('body')).toHaveAttribute('data-chapter', 'turning-point');
  await page.goForward();
  await expect(page.locator('body')).toHaveAttribute('data-chapter', 'armistice');
  await page.getByRole('button', { name: 'Quellen', exact: true }).click();
  await expect(page.locator('.source-entry')).toHaveCount(sources.length);
  for (const source of sources) {
    await expect(page.locator(`#source-${source.id} a`)).toHaveAttribute('href', source.url);
    await expect(page.locator(`#source-${source.id} a`)).toHaveAttribute('rel', 'noopener noreferrer');
  }
  await page.getByRole('button', { name: 'Dieses Kapitel', exact: true }).click();
  await expect(page.locator('.source-entry')).toHaveCount(chapters.at(-1).sourceIds.length);
  await page.keyboard.press('Escape');
  await expect(page.locator('#detail-dialog')).toBeHidden();
  await ready(page, '/?scoutTheme=light#verdun');
  await expect(page.locator('#metric-value')).toHaveText('\u2248 300');
  await expect(page.locator('#campaign-comparison')).toBeVisible();
  await page.locator('.skip-link').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#chapter-heading')).toBeFocused();
  await expect(page.locator('body')).toHaveAttribute('data-chapter', 'verdun');
  await ready(page, '/?scoutTheme=light#unknown');
  await expect(page.locator('body')).toHaveAttribute('data-chapter', 'marne');
  await expect(page.locator('#previous-chapter')).toBeDisabled();
  await page.locator('#tab-marne').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#tab-system')).toBeFocused();
  await expect(page.locator('body')).toHaveAttribute('data-chapter', 'system');
});

test('quiz scores explanations and reset correctly; the whole story prints', async ({ page }) => {
  await ready(page);
  await page.getByRole('button', { name: 'Wissen pr\u00fcfen', exact: true }).click();
  for (const question of quiz) {
    await expect(page.locator('.quiz-fieldset legend')).toHaveText(question.question);
    await page.locator(`input[name="answer"][value="${question.correct}"]`).check();
    await page.getByRole('button', { name: 'Antwort pr\u00fcfen', exact: true }).click();
    await expect(page.locator('.quiz-feedback h3')).toHaveText('Richtig.');
    await expect(page.locator('.quiz-feedback p')).toHaveText(question.explanation);
    await page.locator('#next-question').click();
  }
  await expect(page.locator('.quiz-score')).toHaveText('3 / 3');
  await page.getByRole('button', { name: 'Noch einmal', exact: true }).click();
  await expect(page.locator('.quiz-fieldset legend')).toHaveText(quiz[0].question);
  await page.locator('input[name="answer"][value="1"]').check();
  await page.getByRole('button', { name: 'Antwort pr\u00fcfen', exact: true }).click();
  await expect(page.locator('.quiz-feedback h3')).toHaveText('Noch nicht ganz.');
  await page.getByRole('button', { name: 'Zum belegten Kapitel', exact: true }).click();
  await expect(page.locator('body')).toHaveAttribute('data-chapter', 'system');
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('#reading-print')).toBeVisible();
  await expect(page.locator('#reading-print > section')).toHaveCount(7);
  await expect(page.locator('.print-sources section')).toHaveCount(sources.length);
  await expect(page.locator('#reading-print')).toContainText('28. Juni 1919');
  await expect(page.locator('.app-shell')).toBeHidden();
});

test('reduced motion and dark theme work without an empty canvas', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await ready(page, '/?scoutTheme=light#system');
  await expect(page.getByRole('button', { name: 'Bewegung fortsetzen' })).toHaveAttribute('aria-pressed', 'true');
  const before = (await paintInfo(page)).checksum;
  await page.evaluate(() => new Promise(resolveFrame => requestAnimationFrame(() => requestAnimationFrame(resolveFrame))));
  expect((await paintInfo(page)).checksum).toBe(before);
  await page.getByRole('button', { name: 'Darstellung wechseln', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect.poll(async () => (await paintInfo(page)).checksum).not.toBe(before);
  const dark = await paintInfo(page);
  expect(dark.coverage).toBeGreaterThan(0.2);
  expect(dark.colors).toBeGreaterThan(50);
  await assertLayout(page);
  await page.screenshot({ path: testInfo.outputPath('dark-trenches.png'), fullPage: true });
});

test('built HTML runs offline with no network assets', async ({ page }) => {
  const networkRequests = [];
  page.on('request', request => { if (/^https?:/.test(request.url())) networkRequests.push(request.url()); });
  await page.context().setOffline(true);
  await ready(page, `${pathToFileURL(resolve('dist/index.html')).href}#verdun`);
  await expect(page.locator('#chapter-heading')).toHaveText(chapters[3].title);
  await page.getByRole('button', { name: 'Gr\u00e4ben', exact: true }).click();
  await expect(page.locator('#scene')).toHaveAttribute('data-mode', 'trenches');
  expect((await paintInfo(page)).colors).toBeGreaterThan(50);
  await page.getByRole('button', { name: 'Quellen', exact: true }).click();
  await expect(page.locator('.source-entry')).toHaveCount(sources.length);
  expect(networkRequests).toEqual([]);
});