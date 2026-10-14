import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { load } from 'cheerio';
import { documents, categories, BASE, ORIGIN } from '../src/lib/content.mjs';

const htmlFiles = [];
function walk(directory) { for (const item of fs.readdirSync(directory, { withFileTypes: true })) { const file = path.join(directory, item.name); if (item.isDirectory()) walk(file); else if (file.endsWith('.html')) htmlFiles.push(file); } }
walk('dist');
const publishedArticles = htmlFiles.filter(file => file.startsWith('dist/posts/'));
assert.equal(publishedArticles.length, documents.length, 'Published article count');
const sitemap = load(fs.readFileSync('dist/sitemap.xml', 'utf8'), { xmlMode: true });
assert.equal(sitemap('url').length, documents.length + categories.length + 1, 'Sitemap URL count');
const pages = new Map();
for (const file of htmlFiles) {
  const $ = load(fs.readFileSync(file, 'utf8'));
  const url = BASE + file.slice(5).replace(/index\.html$/, '');
  pages.set(url, $);
  assert.equal($('html').attr('lang'), 'ko', `${file}: language`);
  assert($('title').text().trim(), `${file}: title`);
  assert($('meta[name="description"]').attr('content'), `${file}: description`);
  assert.equal($('link[rel="canonical"]').attr('href'), ORIGIN + url, `${file}: canonical`);
  for (const element of $('script[type="application/ld+json"]').toArray()) JSON.parse($(element).text());
  if (file.startsWith('dist/posts/')) {
    assert.equal($('h1').length, 1, `${file}: unique H1`);
    assert($('[data-pagefind-body]').text().length > 0, `${file}: crawlable article`);
    assert.equal($('meta[name="robots"]').attr('content'), 'index, follow');
  }
}
let localReferences = 0;
for (const [pageURL, $] of pages) {
  for (const element of $('a[href], img[src], script[src], link[href]').toArray()) {
    const value = $(element).attr(element.tagName === 'img' || element.tagName === 'script' ? 'src' : 'href');
    if (!value || /^(https?:|mailto:|tel:|data:|\/\/)/i.test(value)) continue;
    const target = new URL(value, ORIGIN + pageURL);
    assert(target.pathname.startsWith(BASE), `${pageURL}: link escapes /TIL/: ${value}`);
    let relative = decodeURIComponent(target.pathname.slice(BASE.length));
    let output = path.join('dist', relative);
    if (target.pathname.endsWith('/')) output = path.join(output, 'index.html');
    assert(fs.existsSync(output), `${pageURL}: missing local resource ${value}`);
    localReferences++;
    if (target.hash && output.endsWith('.html')) {
      const targetPage = pages.get(target.pathname) || load(fs.readFileSync(output, 'utf8'));
      const fragment = decodeURIComponent(target.hash.slice(1));
      assert(targetPage('[id]').toArray().some(el => targetPage(el).attr('id') === fragment || targetPage(el).attr('id') === target.hash.slice(1)), `${pageURL}: missing fragment ${value}`);
    }
  }
}
for (const loc of sitemap('loc').toArray()) {
  const url = new URL(sitemap(loc).text());
  assert.equal(url.origin, ORIGIN);
  assert(pages.has(decodeURIComponent(url.pathname)), `Sitemap missing page ${url.href}`);
}
assert(fs.existsSync('dist/pagefind/pagefind.js'), 'Search bundle');
console.log(`Verified ${documents.length} articles, ${categories.length} topics, ${localReferences} local references, metadata and sitemap.`);
