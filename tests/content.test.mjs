import test from 'node:test';
import assert from 'node:assert/strict';
import { chapters, sources, checkedOn, quiz, glossary } from '../src/content.mjs';

test('every chapter has unique identity, narrative, a scene and traceable sources', () => {
  const sourceIds = new Set(sources.map(source => source.id));
  assert.equal(sourceIds.size, sources.length);
  assert.equal(new Set(chapters.map(chapter => chapter.id)).size, chapters.length);
  assert.match(checkedOn, /^\d{4}-\d{2}-\d{2}$/);
  for (const chapter of chapters) {
    assert.ok(chapter.paragraphs.length >= 2, chapter.id);
    assert.ok(['map', 'trenches'].includes(chapter.scene), chapter.id);
    assert.ok(chapter.title && chapter.lead && chapter.metric.value && chapter.takeaway, chapter.id);
    assert.ok(chapter.sourceIds.length > 0, chapter.id);
    for (const sourceId of chapter.sourceIds) assert.ok(sourceIds.has(sourceId), sourceId);
  }
  for (const source of sources) {
    assert.equal(new URL(source.url).protocol, 'https:');
    assert.ok(source.institution && source.title && source.evidence, source.id);
  }
});

test('the complete narrative and learning questions cover all seven chapters', () => {
  assert.equal(chapters.length, 7);
  assert.equal(chapters[0].id, 'marne');
  assert.equal(chapters.at(-1).id, 'armistice');
  for (const question of quiz) {
    assert.ok(question.correct >= 0 && question.correct < question.options.length);
    assert.ok(chapters.some(chapter => chapter.id === question.chapter));
    assert.ok(question.explanation);
  }
  for (const term of glossary) {
    for (const sourceId of term.sourceIds) assert.ok(sources.some(source => source.id === sourceId));
  }
});

test('duration figures distinguish rounded museum figures from inclusive calendar counts', () => {
  const daysInclusive = (start, end) => (Date.parse(end) - Date.parse(start)) / 86_400_000 + 1;
  assert.equal(daysInclusive('1916-02-21', '1916-12-18'), 302);
  assert.equal(chapters.find(chapter => chapter.id === 'verdun').metric.value, '\u2248 300');
  assert.equal(daysInclusive('1916-07-01', '1916-11-18'), 141);
  assert.match(chapters.find(chapter => chapter.id === 'verdun').paragraphs.join(' '), /nicht mit 700\.000 Toten/);
  assert.match(chapters.at(-1).paragraphs.join(' '), /28\. Juni 1919/);
});