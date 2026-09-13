import './style.css';
import { createIcons, Landmark, BookOpen, Printer, SunMoon, ArrowUpRight, ArrowLeft, ArrowRight, Map, Layers3, Scan, RotateCcw, Plus, Minus, Pause, Play, MonitorOff, MoveRight, BadgeCheck, X, Check } from 'lucide';
import { chapters, sources, checkedOn, modelNotes, glossary, quiz } from './content.mjs';
import { ExhibitScene } from './scene.mjs';

const icons = { Landmark, BookOpen, Printer, SunMoon, ArrowUpRight, ArrowLeft, ArrowRight, Map, Layers3, Scan, RotateCcw, Plus, Minus, Pause, Play, MonitorOff, MoveRight, BadgeCheck, X, Check };
const refreshIcons = () => createIcons({ icons, attrs: { 'aria-hidden': 'true' } });
const select = selector => document.querySelector(selector);
const dialog = select('#detail-dialog');
const dialogContent = select('#dialog-content');
let chapterIndex = 0;
let exhibit;
let mode = 'map';
let topView = false;
let motion = !matchMedia('(prefers-reduced-motion: reduce)').matches;
let quizIndex = 0;
let quizScore = 0;
let quizAnswered = false;

const sourceNumber = sourceId => sources.findIndex(source => source.id === sourceId) + 1;
const formatDate = new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' }).format(new Date(checkedOn));

function changeMode(nextMode) {
  mode = nextMode;
  topView = false;
  select('#top-view').setAttribute('aria-pressed', 'false');
  select('#map-mode').setAttribute('aria-pressed', String(mode === 'map'));
  select('#trench-mode').setAttribute('aria-pressed', String(mode === 'trenches'));
  select('#open-glossary').hidden = mode !== 'trenches';
  select('#model-caption').textContent = modelNotes[mode];
  select('#scene-legend').innerHTML = mode === 'map'
    ? '<span class="legend-entry"><span class="legend-line"></span>Frontband Ende 1914</span><span class="legend-entry"><span class="legend-dot"></span>Historischer Ort</span>'
    : '<span class="legend-entry"><span class="legend-line"></span>Deutsche Stellungen</span><span class="legend-entry"><span class="legend-line french"></span>Franz\u00f6sische Stellungen</span>';
  exhibit?.setMode(mode);
}

function setChapter(index, { writeHistory = true } = {}) {
  chapterIndex = Math.max(0, Math.min(chapters.length - 1, index));
  const chapter = chapters[chapterIndex];
  const number = String(chapterIndex + 1).padStart(2, '0');
  select('#chapter-number').textContent = number;
  select('#current-page').textContent = number;
  select('#chapter-date').textContent = chapter.date;
  select('#chapter-heading').textContent = chapter.title;
  select('#chapter-lead').textContent = chapter.lead;
  select('#chapter-copy').replaceChildren(...chapter.paragraphs.map(text => {
    const paragraph = document.createElement('p');
    paragraph.textContent = text;
    return paragraph;
  }));
  select('#chapter-takeaway').textContent = chapter.takeaway;
  select('#metric-value').textContent = chapter.metric.value;
  select('#metric-value').classList.toggle('long-value', chapter.metric.value.length > 7);
  select('#metric-unit').textContent = chapter.metric.unit;
  select('#metric-label').textContent = chapter.metric.label;
  select('#previous-chapter').disabled = chapterIndex === 0;
  select('#next-label').textContent = chapters[chapterIndex + 1]?.nav || 'Zum R\u00fcckblick';
  select('#chapter-citations').innerHTML = chapter.sourceIds.map(sourceId => `<button class="citation-button" data-source="${sourceId}" aria-label="Quelle ${sourceNumber(sourceId)}: ${sources.find(source => source.id === sourceId).title}">[${sourceNumber(sourceId)}]</button>`).join('');
  document.querySelectorAll('.chapter-tab').forEach((tab, index) => {
    tab.setAttribute('aria-selected', String(index === chapterIndex));
    tab.tabIndex = index === chapterIndex ? 0 : -1;
  });
  const activeTab = select(`.chapter-tab[data-index="${chapterIndex}"]`);
  const tabs = select('#chapter-tabs');
  tabs.scrollTo({ left: activeTab.offsetLeft - tabs.offsetLeft - tabs.clientWidth / 2 + activeTab.clientWidth / 2, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  select('#campaign-comparison').hidden = !['verdun', 'somme'].includes(chapter.id);
  changeMode(chapter.scene);
  exhibit?.setChapter(chapter);
  select('#chapter-announcement').textContent = `Kapitel ${chapterIndex + 1} von 7. ${chapter.title}`;
  document.title = `${chapter.nav} | Die Westfront 1914 bis 1918`;
  document.body.dataset.chapter = chapter.id;
  if (writeHistory && location.hash !== `#${chapter.id}`) history.pushState(null, '', `#${chapter.id}`);
}

function openDialog(eyebrow, heading) {
  select('#dialog-eyebrow').textContent = eyebrow;
  select('#dialog-heading').textContent = heading;
  if (!dialog.open) dialog.showModal();
  dialog.scrollTop = 0;
  refreshIcons();
}

function showSources(scope = 'chapter', focusId) {
  const chapter = chapters[chapterIndex];
  const selectedSources = scope === 'all' ? sources : sources.filter(source => chapter.sourceIds.includes(source.id));
  dialogContent.innerHTML = `
    <div class="segmented-control source-filters" aria-label="Quellenauswahl">
      <button data-source-scope="chapter" aria-pressed="${scope === 'chapter'}">Dieses Kapitel</button>
      <button data-source-scope="all" aria-pressed="${scope === 'all'}">Alle ${sources.length} Quellen</button>
    </div>
    <p class="source-note">${scope === 'chapter' ? `${chapter.title} ${chapter.note || 'Die folgenden Quellen belegen und kontextualisieren die Aussagen dieses Kapitels.'}` : `Institutionelle Darstellungen und Nachschlagewerke, gelesen und abgeglichen am ${formatDate}. Alle Erz\u00e4hltexte sind neu formuliert, keine erfundenen Zeitzeugenberichte.`}</p>
    ${selectedSources.map(source => `
      <section class="source-entry" id="source-${source.id}">
        <div class="source-institution">[${sourceNumber(source.id)}] ${source.institution}</div>
        <h3>${source.title}</h3>
        <p>${source.evidence}</p>
        <a href="${source.url}" target="_blank" rel="noopener noreferrer">Originalquelle <i data-lucide="arrow-up-right"></i></a>
      </section>`).join('')}
    <details class="method-note"><summary>Was ist belegt, was ist vereinfacht?</summary>
      <p><strong>700 Kilometer:</strong> ungef\u00e4hre L\u00e4nge der Westfront, nicht die Summe aller Gr\u00e4ben. Abgeglichen zwischen DHM und Britannica.</p>
      <p><strong>Verdun:</strong> Die gerundeten 300 Tage des M\u00e9morials entsprechen 302 Kalendertagen vom 21. Februar bis 18. Dezember 1916 einschlie\u00dflich beider Endtage. Die hier verwendeten rund 700.000 Gesamtverluste meinen Gefallene und Verwundete zusammen, nicht nur Tote. Das DHM nennt eine deutlich abweichende Totenzahl, die wir nicht \u00fcbernehmen.</p>
      <p><strong>Somme:</strong> Der Zeitraum 1. Juli bis 18. November folgt dem National Army Museum. 141 Tage sind die daraus berechnete inklusive Kalenderdauer. Der <a href="https://www.britannica.com/event/First-Battle-of-the-Somme" target="_blank" rel="noopener noreferrer">Britannica-Artikel zur Somme</a> nennt abweichend den 13. November; diese Datierung verwenden wir nicht.</p>
      <p><strong>Modelle:</strong> Die Karte dient der Orientierung, ihr Frontband zeigt schematisch Ende 1914, auch in sp\u00e4teren Kapiteln. Keine tagesgenauen Bewegungen, keine heutigen Staatsgrenzen. Das Grabenmodell ist nicht ma\u00dfstabsgetreu und bildet keinen konkreten historischen Ort nach. Weder Breiten noch Tiefen lassen sich daraus ablesen.</p>
      <p><strong>Kartengrundlage:</strong> K\u00fcstenumrisse von <a href="https://www.naturalearthdata.com/about/terms-of-use/" target="_blank" rel="noopener noreferrer">Natural Earth (Public Domain)</a>. Die r\u00e4umlichen Modelle sind eigens f\u00fcr dieses Projekt erstellt.</p>
    </details>`;
  openDialog(`QUELLENPR\u00dcFUNG / ${formatDate}`, 'Geschichte braucht Belege.');
  if (focusId) select(`#source-${focusId}`)?.scrollIntoView({ block: 'nearest', behavior: 'instant' });
}

function showFeature(id) {
  const feature = glossary.find(term => term.id === id);
  if (!feature) return;
  const source = sources.find(item => item.id === feature.sourceIds[0]);
  dialogContent.innerHTML = `<p class="feature-description">${feature.text}</p><p class="source-note">${modelNotes.trenches}</p><p class="feature-citation">Beleg: <a href="${source.url}" target="_blank" rel="noopener noreferrer">${source.institution}, ${source.title}</a></p>`;
  openDialog('IM GRABENSYSTEM', feature.title);
}

function showGlossary() {
  dialogContent.innerHTML = `<p class="source-note">${modelNotes.trenches}</p>${glossary.map((term, index) => `<section class="source-entry"><div class="source-institution">0${index + 1}</div><h3>${term.title}</h3><p>${term.text}</p></section>`).join('')}<p class="feature-citation">Beleg: <a href="${sources.find(source => source.id === 'dhm-trenches').url}" target="_blank" rel="noopener noreferrer">Deutsches Historisches Museum: Der Stellungskrieg</a></p>`;
  openDialog('IM GRABENSYSTEM', 'Zwischen den Linien.');
}

function showQuiz() {
  quizIndex = 0;
  quizScore = 0;
  renderQuestion();
}

function renderQuestion() {
  quizAnswered = false;
  const question = quiz[quizIndex];
  dialogContent.innerHTML = `
    <div class="quiz-progress" aria-label="Frage ${quizIndex + 1} von ${quiz.length}">${quiz.map((_, index) => `<span class="${index <= quizIndex ? 'complete' : ''}"></span>`).join('')}</div>
    <form id="quiz-form"><fieldset class="quiz-fieldset"><legend>${question.question}</legend>
      ${question.options.map((option, index) => `<label class="quiz-option"><input type="radio" name="answer" value="${index}" required /><span>${option}</span></label>`).join('')}
      </fieldset><div id="quiz-feedback" aria-live="polite"></div>
      <div class="quiz-actions"><button class="next-button" type="submit" id="check-answer">Antwort pr\u00fcfen<i data-lucide="check"></i></button></div>
    </form>`;
  openDialog(`R\u00dcCKBLICK / FRAGE ${quizIndex + 1} VON 3`, 'Was bleibt im Kopf?');
  select('#quiz-form').addEventListener('submit', event => {
    event.preventDefault();
    if (quizAnswered) return;
    const answer = Number(new FormData(event.currentTarget).get('answer'));
    const correct = answer === question.correct;
    quizAnswered = true;
    if (correct) quizScore++;
    select('.quiz-fieldset').disabled = true;
    select('#quiz-feedback').innerHTML = `<div class="quiz-feedback"><h3>${correct ? 'Richtig.' : 'Noch nicht ganz.'}</h3><p>${question.explanation}</p><button type="button" class="inline-button" data-review-chapter="${question.chapter}">Zum belegten Kapitel<i data-lucide="arrow-up-right"></i></button></div>`;
    select('.quiz-actions').innerHTML = `<button type="button" class="next-button" id="next-question">${quizIndex < quiz.length - 1 ? 'N\u00e4chste Frage' : 'Zum Ergebnis'}<i data-lucide="arrow-right"></i></button>`;
    refreshIcons();
    select('#next-question').focus();
    select('#next-question').addEventListener('click', () => {
      quizIndex++;
      if (quizIndex < quiz.length) renderQuestion();
      else renderQuizResult();
    });
  });
}

function renderQuizResult() {
  dialogContent.innerHTML = `<div class="quiz-result"><div class="quiz-score">${quizScore} / ${quiz.length}</div><p>${quizScore === quiz.length ? 'Alle Zusammenh\u00e4nge richtig eingeordnet.' : 'Die Quellen und Kapitel bleiben zum Nachlesen da.'}</p><p>Die wichtigste Erkenntnis: Eine fast unbewegliche Linie kann eine ganze Welt ver\u00e4ndern.</p><div class="quiz-actions"><button class="text-button" id="retry-quiz"><i data-lucide="rotate-ccw"></i>Noch einmal</button><button class="next-button" id="back-to-story">Zur Geschichte<i data-lucide="arrow-right"></i></button></div></div>`;
  openDialog('R\u00dcCKBLICK / ERGEBNIS', 'Geschichte eingeordnet.');
  select('#retry-quiz').addEventListener('click', showQuiz);
  select('#back-to-story').addEventListener('click', () => dialog.close());
}

function buildPrintVersion() {
  select('#reading-print').innerHTML = `<h1>Die Westfront. 1914 bis 1918</h1><p>Deutschland und Frankreich im Stellungskrieg. Dokumentarische Lesefassung.</p>
    ${chapters.map((chapter, index) => `<section><h2>${index + 1}. ${chapter.title}</h2><p><strong>${chapter.date}</strong></p><p><strong>${chapter.lead}</strong></p>${chapter.paragraphs.map(text => `<p>${text}</p>`).join('')}<p>${chapter.takeaway}</p>${chapter.note ? `<p class="print-note">Einordnung: ${chapter.note}</p>` : ''}<p class="print-note">Belege: ${chapter.sourceIds.map(sourceId => `[${sourceNumber(sourceId)}]`).join(', ')}</p></section>`).join('')}
    <div class="print-sources"><h2>Quellen und Grenzen der Darstellung</h2><p>Online gelesen und abgeglichen am ${formatDate}. Die Erz\u00e4hlung enth\u00e4lt keine erfundenen Zeitzeugen. Rund 700 Kilometer meint die Frontl\u00e4nge. Die Modelle sind nicht ma\u00dfstabsgetreu; die Karte verwendet ein vereinfachtes Frontband Ende 1914 ohne Staatsgrenzen.</p>${sources.map(source => `<section><h3>[${sourceNumber(source.id)}] ${source.institution}: ${source.title}</h3><p>${source.evidence}<br /><a href="${source.url}">${source.url}</a></p></section>`).join('')}</div>`;
}

select('#chapter-tabs').innerHTML = chapters.map((chapter, index) => `<button class="chapter-tab" id="tab-${chapter.id}" role="tab" data-index="${index}" aria-controls="story-panel" aria-selected="${index === 0}" tabindex="${index === 0 ? 0 : -1}"><span class="tab-year">${chapter.year}</span><span class="tab-name">${chapter.nav}</span></button>`).join('');
select('#checked-date').textContent = formatDate;
select('.skip-link').addEventListener('click', event => {
  event.preventDefault();
  select('#chapter-heading').focus();
  select('#chapter-heading').scrollIntoView({ block: 'start' });
});
select('#chapter-tabs').addEventListener('click', event => {
  const button = event.target.closest('[data-index]');
  if (button) setChapter(Number(button.dataset.index));
});
select('#chapter-tabs').addEventListener('keydown', event => {
  let nextIndex = chapterIndex;
  if (event.key === 'ArrowRight') nextIndex = (chapterIndex + 1) % chapters.length;
  else if (event.key === 'ArrowLeft') nextIndex = (chapterIndex + chapters.length - 1) % chapters.length;
  else if (event.key === 'Home') nextIndex = 0;
  else if (event.key === 'End') nextIndex = chapters.length - 1;
  else return;
  event.preventDefault();
  setChapter(nextIndex);
  select(`.chapter-tab[data-index="${nextIndex}"]`).focus({ preventScroll: true });
});
select('#previous-chapter').addEventListener('click', () => setChapter(chapterIndex - 1));
select('#next-chapter').addEventListener('click', () => chapterIndex === chapters.length - 1 ? showQuiz() : setChapter(chapterIndex + 1));
select('#all-sources').addEventListener('click', () => showSources('all'));
select('#verification').addEventListener('click', () => showSources('all'));
select('#chapter-sources').addEventListener('click', () => showSources());
select('#chapter-citations').addEventListener('click', event => {
  const source = event.target.closest('[data-source]');
  if (source) showSources('chapter', source.dataset.source);
});
select('#map-mode').addEventListener('click', () => changeMode('map'));
select('#trench-mode').addEventListener('click', () => changeMode('trenches'));
select('#open-glossary').addEventListener('click', showGlossary);
select('#zoom-in').addEventListener('click', () => exhibit?.zoom(1.15));
select('#zoom-out').addEventListener('click', () => exhibit?.zoom(1 / 1.15));
select('#top-view').addEventListener('click', () => {
  topView = !topView;
  select('#top-view').setAttribute('aria-pressed', String(topView));
  exhibit?.topView(topView);
});
select('#reset-view').addEventListener('click', () => {
  topView = false;
  select('#top-view').setAttribute('aria-pressed', 'false');
  exhibit?.resetCamera();
});

function updateMotionButton() {
  const button = select('#toggle-motion');
  button.setAttribute('aria-label', motion ? 'Bewegung pausieren' : 'Bewegung fortsetzen');
  button.dataset.tooltip = button.getAttribute('aria-label');
  button.setAttribute('aria-pressed', String(!motion));
  button.innerHTML = `<i data-lucide="${motion ? 'pause' : 'play'}"></i>`;
  refreshIcons();
}

select('#toggle-motion').addEventListener('click', () => {
  motion = !motion;
  exhibit?.setMotion(motion);
  updateMotionButton();
});
select('#theme-toggle').addEventListener('click', () => {
  document.documentElement.dataset.theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  exhibit?.setTheme();
});
select('#print-story').addEventListener('click', () => window.print());
select('#open-quiz').addEventListener('click', showQuiz);
select('#close-dialog').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
});
dialogContent.addEventListener('click', event => {
  const scope = event.target.closest('[data-source-scope]');
  if (scope) showSources(scope.dataset.sourceScope);
  const review = event.target.closest('[data-review-chapter]');
  if (review) {
    dialog.close();
    setChapter(chapters.findIndex(chapter => chapter.id === review.dataset.reviewChapter));
    select('#chapter-heading').focus();
  }
});

const readLocation = () => setChapter(Math.max(0, chapters.findIndex(chapter => chapter.id === location.hash.slice(1))), { writeHistory: false });
window.addEventListener('popstate', readLocation);
window.addEventListener('hashchange', readLocation);
buildPrintVersion();
readLocation();
updateMotionButton();
try {
  exhibit = new ExhibitScene(select('#scene'), select('#scene-labels'), {
    onChapter: id => setChapter(chapters.findIndex(chapter => chapter.id === id)),
    onFeature: showFeature,
    onError: () => { select('#scene-fallback').hidden = false; },
    onRestore: () => { select('#scene-fallback').hidden = true; }
  });
  exhibit.setChapter(chapters[chapterIndex]);
} catch (error) {
  select('#scene-fallback').hidden = false;
  select('#scene').dataset.ready = 'false';
  console.error('Die 3D-Ansicht konnte nicht initialisiert werden.', error);
}
if (import.meta.hot) import.meta.hot.dispose(() => exhibit?.dispose());