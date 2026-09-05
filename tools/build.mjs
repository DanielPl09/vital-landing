/* Vital — link-preview build
 *
 *   node tools/build.mjs
 *
 * Writes, for every slug in content/posts.json:
 *   posts/<slug>.html              the shareable page, with static meta tags
 *   assets/img/blog/og/<slug>.png  the preview image, 1200x630
 *
 * Why this exists. WhatsApp, Slack, iMessage, Facebook and X read link
 * previews with crawlers that fetch the raw HTML and never run JavaScript.
 * blog.js rewrites og:title once a post loads, but that happens in a browser,
 * long after the crawler has read the file and left — so every ?post= link
 * previewed as the generic "Writing — Vital". A query string cannot vary what
 * is inside a static file either, so each post needs a real file of its own.
 * That is all this script makes.
 *
 * The page shell is not duplicated here: blog.html is the template, and the
 * block between its `share:start` / `share:end` markers is what gets swapped.
 * Edit the shell there and re-run; nothing about the layout lives in this file.
 *
 * The article body is still rendered client-side by blog.js, exactly as before.
 * Only the metadata is baked in, which is all a preview needs.
 *
 * Adding a post is still: drop the .md in, add the slug to posts.json — then
 * run this once so the shareable page and its PNG exist.
 */
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/* Absolute URLs are mandatory in og:image and og:url — a crawler has no page
   context to resolve a relative path against. Change this one line if the site
   moves to a custom domain, then re-run. Trailing slash required. */
const SITE = 'https://danielpl09.github.io/vital-landing/';

const OG_DIR = 'assets/img/blog/og';
const OUT_DIR = 'posts';
const OG_W = 1200;
const OG_H = 630; // 1.91:1, the ratio WhatsApp and Facebook crop to

/* ---------- helpers ---------- */

const attr = (s) =>
  String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const abs = (p) => SITE + String(p).replace(/^\.?\//, '');

// Same frontmatter contract as blog.js: strip BOM, normalise CRLF, then read
// the leading --- block. Kept deliberately identical so a post that renders in
// the browser cannot fail to build here.
function parse(text) {
  text = text.replace(/^﻿/, '').replace(/\r\n?/g, '\n');
  const m = /^---\n([\s\S]*?)\n---\n?/.exec(text);
  if (!m) return { meta: {}, body: text };
  const meta = {};
  for (const line of m[1].split('\n')) {
    const kv = /^([\w-]+):\s*(.*)$/.exec(line.trim());
    if (kv) meta[kv[1]] = kv[2].replace(/^["']|["']$/g, '');
  }
  return { meta, body: text.slice(m[0].length) };
}

/* Every relative href/src in the shell has to gain a ../ once the page sits in
   posts/. Absolute URLs, anchors and the inline data: favicon are left alone. */
function reroot(html) {
  return html.replace(/\b(href|src)="([^"]*)"/g, (whole, a, v) =>
    /^(https?:)?\/\/|^(data|mailto|tel):|^#/i.test(v) ? whole : `${a}="../${v}"`
  );
}

/* ---------- the per-post <head> ---------- */

function shareBlock(post) {
  const title = post.meta.title || post.slug;
  const desc = post.meta.excerpt || '';
  const url = abs(`${OUT_DIR}/${post.slug}.html`);
  const img = abs(`${OG_DIR}/${post.slug}.png`);

  return [
    `<title>${attr(title)} — Vital</title>`,
    `<meta name="description" content="${attr(desc)}" />`,
    `<link rel="canonical" href="${attr(url)}" />`,
    `<meta property="og:site_name" content="Vital" />`,
    `<meta property="og:type" content="article" />`,
    `<meta property="og:url" content="${attr(url)}" />`,
    `<meta property="og:title" content="${attr(title)}" />`,
    `<meta property="og:description" content="${attr(desc)}" />`,
    `<meta property="og:image" content="${attr(img)}" />`,
    `<meta property="og:image:width" content="${OG_W}" />`,
    `<meta property="og:image:height" content="${OG_H}" />`,
    `<meta property="og:image:type" content="image/png" />`,
    `<meta property="og:image:alt" content="${attr(title)}" />`,
    post.meta.date
      ? `<meta property="article:published_time" content="${attr(post.meta.date)}" />`
      : null,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${attr(title)}" />`,
    `<meta name="twitter:description" content="${attr(desc)}" />`,
    `<meta name="twitter:image" content="${attr(img)}" />`,
    // How blog.js knows which post to render, and how to reach content/ and
    // assets/ from one directory down.
    `<meta name="site-base" content="../" />`,
    `<meta name="post-slug" content="${attr(post.slug)}" />`,
  ].filter(Boolean).join('\n');
}

/* ---------- image ---------- */

// density matters: the source is vector, so this is the rasterisation detail
// before the resize, not the output size. Too low and curves alias.
async function png(svgPath, outPath) {
  const buf = await sharp(svgPath, { density: 200 })
    .resize(OG_W, OG_H, { fit: 'cover', position: 'centre' })
    .png({ compressionLevel: 9 })
    .toBuffer();
  await writeFile(outPath, buf);
  return buf.length;
}

/* ---------- build ---------- */

const template = await readFile(join(ROOT, 'blog.html'), 'utf8');

const MARKERS = /<!-- share:start[\s\S]*?<!-- share:end -->/;
if (!MARKERS.test(template)) {
  console.error('blog.html has no share:start / share:end markers — nothing to replace.');
  process.exit(1);
}

const slugs = JSON.parse(await readFile(join(ROOT, 'content/posts.json'), 'utf8'));
await mkdir(join(ROOT, OG_DIR), { recursive: true });
await mkdir(join(ROOT, OUT_DIR), { recursive: true });

let built = 0;
const seen = new Set();

for (const slug of slugs) {
  let raw;
  try {
    raw = await readFile(join(ROOT, 'content/posts', `${slug}.md`), 'utf8');
  } catch {
    console.warn(`  skipped ${slug} — no content/posts/${slug}.md`);
    continue;
  }

  const post = { slug, ...parse(raw) };
  if (!post.meta.title) console.warn(`  ${slug}: no title in frontmatter`);
  if (!post.meta.excerpt) console.warn(`  ${slug}: no excerpt — preview will have no description`);

  // The cover art doubles as the preview image, so a post with no image
  // still gets one rather than an empty card.
  const src = post.meta.image || 'assets/img/blog/five-lessons.svg';
  const bytes = await png(join(ROOT, src), join(ROOT, OG_DIR, `${slug}.png`));

  const html = reroot(template.replace(MARKERS, shareBlock(post)));
  await writeFile(join(ROOT, OUT_DIR, `${slug}.html`), html);

  seen.add(`${slug}.html`);
  built++;
  console.log(`  ${slug}.html  +  ${slug}.png (${Math.round(bytes / 1024)} KB)`);
}

// The blog index is shared as a link too, and needs a raster image for the
// same reason the posts do.
await png(join(ROOT, 'assets/img/blog/five-lessons.svg'), join(ROOT, OG_DIR, 'index.png'));

// A slug removed from posts.json leaves a stale page behind that would still
// resolve and still preview. Say so rather than silently leaving it.
const stale = (await readdir(join(ROOT, OUT_DIR)))
  .filter((f) => f.endsWith('.html') && !seen.has(f));
if (stale.length) {
  console.log(`\n  orphaned (not in posts.json, safe to delete): ${stale.join(', ')}`);
}

console.log(`\nBuilt ${built} post page${built === 1 ? '' : 's'} + index.png`);
