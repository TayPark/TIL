import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import MarkdownIt from 'markdown-it';
import anchor from 'markdown-it-anchor';
import { load } from 'cheerio';
import { createHighlighter } from 'shiki';
import { slug as headingSlug } from 'github-slugger';

export const BASE = '/TIL/';
export const ORIGIN = 'https://taypark.github.io';
export const AUTHOR = 'TayPark';
export const categoryNames = {
  'Data Engineering': '데이터 엔지니어링', architecture: '아키텍처', aws: 'AWS',
  books: '책', retrospective: '회고', etc: '기술 노트',
  'microsoft-learning': '분산 컴퓨팅', inflearn: '강의 노트', DDD: '도메인 주도 설계', conferences: '컨퍼런스',
};
const legacyConferenceFolders = ['2020 Woowa TechConf', '2021 Slash21', 'NHN Forward 2020'];
const legacyPath = file => file.startsWith('conferences/') && legacyConferenceFolders.includes(file.split('/')[1]) ? file.slice('conferences/'.length) : file;
export const tracked = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean);
const sourceFiles = tracked.filter(file => file.endsWith('.md') && !file.startsWith('.') && file !== 'README.md' && !file.startsWith('site-docs/'));
export const slugFor = file => file.replace(/\.md$/i, '').split('/').map(part => part.normalize('NFKC').toLowerCase().replace(/\s+/g, '-').replace(/[^\p{L}\p{N}._-]/gu, '-').replace(/-+/g, '-')).join('/');
export const articleURL = file => `${BASE}posts/${slugFor(legacyPath(file))}/`;
const fileLookup = new Map(sourceFiles.flatMap(file => [[file.toLowerCase(), file], [legacyPath(file).toLowerCase(), file]]));
const highlighter = await createHighlighter({ themes: ['github-light'], langs: ['bash', 'sql', 'python', 'javascript', 'typescript', 'java', 'json', 'yaml', 'xml', 'scala', 'dockerfile', 'text'] });
const markdown = new MarkdownIt({ html: true, linkify: true, typographer: false,
  highlight(code, language) {
    const lang = highlighter.getLoadedLanguages().includes(language) ? language : 'text';
    return highlighter.codeToHtml(code, { lang, theme: 'github-light' });
  },
}).use(anchor, { slugify: headingSlug });

function normalizeFragment(value) {
  const index = value.indexOf('#');
  if (index === -1) return value;
  try { return value.slice(0, index + 1) + headingSlug(decodeURIComponent(value.slice(index + 1))); }
  catch { return value; }
}
function resolveURL(value, file) {
  if (!value || /^(?:mailto:|tel:|data:)/i.test(value)) return value;
  if (value.startsWith('#')) return normalizeFragment(value);
  let decoded;
  try { decoded = decodeURIComponent(value); } catch { return value; }
  const github = decoded.match(/^https?:\/\/github\.com\/taypark\/til\/blob\/[^/]+\/(.*)$/i);
  if (!github && /^(?:https?:)?\/\//i.test(decoded)) return value;
  const raw = github ? github[1] : decoded;
  const match = raw.match(/^([^?#]*)(.*)$/);
  const pathname = match[1];
  const suffix = normalizeFragment(match[2]);
  let target = github || pathname.startsWith('/') ? pathname.replace(/^\//, '') : path.posix.normalize(path.posix.join(path.posix.dirname(file), pathname));
  const document = fileLookup.get(target.toLowerCase());
  if (document) return articleURL(document) + suffix;
  if (target === 'README.md') return BASE + suffix;
  if (legacyConferenceFolders.some(folder => target.startsWith(folder + '/'))) target = 'conferences/' + target;
  if (tracked.includes(target)) return BASE + 'source-assets/' + target.split('/').map(encodeURIComponent).join('/') + suffix;
  return value;
}

export const documents = sourceFiles.map(file => {
  const source = fs.readFileSync(file, 'utf8');
  const $ = load(markdown.render(source));
  const firstTitle = $('h1').first();
  const title = firstTitle.text().trim() || path.basename(file, '.md');
  firstTitle.remove();
  if ($('h1').length) {
    $('h1, h2, h3, h4, h5').each((_, element) => {
      element.tagName = element.name = 'h' + (Number(element.tagName.slice(1)) + 1);
    });
  }
  // Preserve two legacy source links which refer to the deployment section.
  if (file === 'architecture/12-factors-app.md') {
    $('h2[id="빌드-릴리즈-실행"]').prepend('<span id="배포"></span>');
  }
  const description = $('p, li').toArray().map(el => $(el).text().replace(/\s+/g, ' ').trim()).find(text => text.length >= 25 && !/^(?:source|src|date|출처|소스|원본)\s*:|^https?:\/\//i.test(text))?.slice(0, 180) || `${title}에 관한 학습 기록.`;
  const headings = $('h2, h3').toArray().map(el => ({ text: $(el).text(), id: $(el).attr('id'), depth: el.tagName === 'h2' ? 2 : 3 }));
  $('a[href]').each((_, el) => $(el).attr('href', resolveURL($(el).attr('href'), file)));
  $('img[src]').each((_, el) => {
    const image = $(el);
    const src = image.attr('src');
    if (/\.html(?:[?#]|$)/i.test(src)) {
      image.replaceWith($('<a>').attr('href', src).text(image.attr('alt') || '참고 자료'));
    } else {
      image.attr('src', resolveURL(src, file)).attr('loading', 'lazy').attr('decoding', 'async');
      if (!image.attr('alt')) image.attr('alt', `${title}의 참고 이미지`);
    }
  });
  $('table').each((_, el) => $(el).wrap('<div class="table-scroll" tabindex="0"></div>'));
  // Follow directory moves while retaining the last content commit date.
  const historyDate = historyPath => execFileSync('git', ['log', '--follow', '--diff-filter=AM', '-1', '--format=%cI', '--', historyPath], { encoding: 'utf8' }).trim();
  const modified = historyDate(file) || historyDate(legacyPath(file));
  const category = file.split('/')[0];
  const conference = category === 'conferences' ? file.split('/')[1] : undefined;
  return { file, title, description, headings, modified, category, conference, categoryLabel: categoryNames[category] || category,
    slug: slugFor(legacyPath(file)), url: articleURL(file), html: $('body').html(),
    sourceURL: 'https://github.com/TayPark/TIL/blob/master/' + file.split('/').map(encodeURIComponent).join('/') };
}).sort((a, b) => b.modified.localeCompare(a.modified) || a.title.localeCompare(b.title));
if (new Set(documents.map(doc => doc.slug)).size !== documents.length) throw new Error('Duplicate article URLs');
export const categories = [...new Set(documents.map(doc => doc.category))].sort().map(category => ({
  name: category, label: categoryNames[category] || category,
  count: documents.filter(doc => doc.category === category).length,
  url: `${BASE}topics/${slugFor(category + '.md')}/`,
}));
export const conferences = [...new Set(documents.filter(doc => doc.conference).map(doc => doc.conference))].sort().map(conference => ({
  name: conference, label: conference, parent: 'conferences',
  count: documents.filter(doc => doc.conference === conference).length,
  url: `${BASE}topics/${slugFor((legacyConferenceFolders.includes(conference) ? conference : 'conferences-' + conference) + '.md')}/`,
}));
const conferenceCategory = categories.find(category => category.name === 'conferences');
if (conferenceCategory) conferenceCategory.children = conferences;
export const topics = [...categories, ...conferences];
