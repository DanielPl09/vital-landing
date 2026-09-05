/* Vital — mini CMS
 *
 * Adding a post is two steps and no build:
 *   1. drop a .md file into content/posts/, with frontmatter at the top
 *   2. add its slug to content/posts.json
 *
 * The index has to exist because static hosting cannot list a directory —
 * GitHub Pages will not tell us what is in content/posts/. Everything else
 * (title, date, tag, thumbnail, excerpt, reading time) is read from the file
 * itself, so the post stays a single editable document.
 *
 * Frontmatter keys:
 *   title    required
 *   date     YYYY-MM-DD — also what the index is sorted by, newest first
 *   tag      one word, shown as a chip
 *   image    path to the thumbnail, relative to the site root
 *   excerpt  one or two sentences; used on the card, as the article dek,
 *            and as the meta/og description
 *
 * No dependencies, matching the rest of this site. The markdown subset below
 * is deliberately small: headings, paragraphs, lists, blockquotes, rules,
 * links, bold, italic, inline code, a `![caption](path)` line for a figure,
 * plus one `:::` block for callouts.
 * Enough to write with, small enough to read in one sitting.
 */
(function () {
  'use strict';

  var INDEX = 'content/posts.json';
  var DIR = 'content/posts/';
  var FALLBACK_IMG = 'assets/img/blog/five-lessons.svg';

  /* ---------- markdown ---------- */

  function escapeHtml(s) {
    return s.replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  // Only same-site paths and http(s)/mailto get to be links. Anything else
  // renders as plain text — a post is authored content, but there is no
  // reason for the renderer to be the weak point if that ever changes.
  function safeHref(h) {
    return /^(https?:\/\/|mailto:|#|\.?\/|[\w.-]+\.html|[\w./-]+)/i.test(h) && !/^javascript:/i.test(h);
  }

  function inline(s) {
    s = escapeHtml(s);
    s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
    s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (m, text, href) {
      if (!safeHref(href)) return text;
      var ext = /^https?:\/\//i.test(href) ? ' target="_blank" rel="noopener"' : '';
      return '<a href="' + href + '"' + ext + '>' + text + '</a>';
    });
    return s;
  }

  /* Callouts. `::: take` … `:::` wraps a block in an aside — the one piece
     of structure this site's essays need that plain markdown has no word
     for. `source` is the small citation line that sits under a question
     heading; `take` is where we say what we did about it. Anything else
     falls through to a plain aside rather than erroring, so a typo in the
     name costs a border colour, not the article. */
  var CALLOUTS = { take: "Vital's take", note: 'Note' };

  function callout(name, body) {
    if (name === 'source') {
      return '<p class="post__source">' + inline(body.trim()) + '</p>';
    }
    var label = CALLOUTS[name];
    return '<aside class="callout callout--' + escapeHtml(name) + '">' +
      (label ? '<p class="callout__label">' + escapeHtml(label) + '</p>' : '') +
      render(body) +
    '</aside>';
  }

  var BLOCK_START = /^(#{1,4}\s|[-*]\s+|\d+\.\s+|>\s?|:::|!\[|---+\s*$)/;

  function render(md) {
    var lines = md.replace(/\r\n?/g, '\n').split('\n');
    var out = [];
    var i = 0;

    while (i < lines.length) {
      var line = lines[i];

      if (!line.trim()) { i++; continue; }

      if (/^:::/.test(line)) {
        var name = line.replace(/^:::+/, '').trim().toLowerCase() || 'note';
        var block = [];
        i++;
        while (i < lines.length && !/^:::\s*$/.test(lines[i])) { block.push(lines[i]); i++; }
        i++; // the closing fence
        out.push(callout(name, block.join('\n')));
        continue;
      }

      if (/^---+\s*$/.test(line)) { out.push('<hr>'); i++; continue; }

      /* A `![caption](path)` line on its own is a figure. The illustrations
         in these posts carry part of the argument, so the caption is where
         the numbers and the reading go and the art itself stays wordless —
         which is also why alt is empty: the caption is the description, and
         a screen reader should hear it once, not twice. */
      var fig = /^!\[([^\]]*)\]\(([^)\s]+)\)\s*$/.exec(line);
      if (fig) {
        i++;
        if (safeHref(fig[2])) {
          out.push('<figure class="post__figure">' +
            '<img src="' + fig[2] + '" alt="" loading="lazy" decoding="async">' +
            (fig[1] ? '<figcaption>' + inline(fig[1]) + '</figcaption>' : '') +
          '</figure>');
        }
        continue;
      }

      var h = /^(#{1,4})\s+(.*)$/.exec(line);
      if (h) {
        out.push('<h' + h[1].length + '>' + inline(h[2]) + '</h' + h[1].length + '>');
        i++; continue;
      }

      if (/^>\s?/.test(line)) {
        var quote = [];
        while (i < lines.length && /^>\s?/.test(lines[i])) {
          quote.push(lines[i].replace(/^>\s?/, '')); i++;
        }
        out.push('<blockquote>' + render(quote.join('\n')) + '</blockquote>');
        continue;
      }

      if (/^[-*]\s+/.test(line)) {
        var ul = [];
        while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
          ul.push('<li>' + inline(lines[i].replace(/^[-*]\s+/, '')) + '</li>'); i++;
        }
        out.push('<ul>' + ul.join('') + '</ul>');
        continue;
      }

      if (/^\d+\.\s+/.test(line)) {
        var ol = [];
        while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
          ol.push('<li>' + inline(lines[i].replace(/^\d+\.\s+/, '')) + '</li>'); i++;
        }
        out.push('<ol>' + ol.join('') + '</ol>');
        continue;
      }

      var para = [];
      while (i < lines.length && lines[i].trim() && !BLOCK_START.test(lines[i])) {
        para.push(lines[i]); i++;
      }
      out.push('<p>' + inline(para.join(' ')) + '</p>');
    }

    return out.join('\n');
  }

  /* ---------- frontmatter ---------- */

  function parse(text) {
    // A post written on Windows — or checked out with autocrlf — arrives with
    // CRLF. The body renderer already normalises; this has to as well, or the
    // frontmatter block silently fails to match and the post loses its title,
    // cover and excerpt to the fallbacks without raising anything.
    text = text.replace(/^﻿/, '').replace(/\r\n?/g, '\n');
    var m = /^---\n([\s\S]*?)\n---\n?/.exec(text);
    if (!m) return { meta: {}, body: text };
    var meta = {};
    m[1].split('\n').forEach(function (line) {
      var kv = /^([\w-]+):\s*(.*)$/.exec(line.trim());
      if (kv) meta[kv[1]] = kv[2].replace(/^["']|["']$/g, '');
    });
    return { meta: meta, body: text.slice(m[0].length) };
  }

  function readingTime(body) {
    return Math.max(1, Math.round(body.trim().split(/\s+/).length / 200));
  }

  function prettyDate(iso) {
    var d = new Date(iso + 'T00:00:00');
    if (isNaN(d)) return iso || '';
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  // Thumbnails are authored art, not user input, but they still go through
  // the same href gate as links — one rule for anything the renderer emits
  // as a URL.
  function imageOf(post) {
    var src = post.meta.image;
    return src && safeHref(src) ? src : FALLBACK_IMG;
  }

  function setMeta(selector, attr, value) {
    var el = document.querySelector(selector);
    if (el && value) el.setAttribute(attr, value);
  }

  /* ---------- loading ---------- */

  function loadPost(slug) {
    return fetch(DIR + slug + '.md', { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error(slug + ' → ' + r.status);
      return r.text();
    }).then(function (text) {
      var p = parse(text);
      p.slug = slug;
      p.readingTime = p.meta.readingTime || readingTime(p.body);
      return p;
    });
  }

  function loadIndex() {
    return fetch(INDEX, { cache: 'no-cache' })
      .then(function (r) {
        if (!r.ok) throw new Error('posts.json → ' + r.status);
        return r.json();
      })
      // One request per post. Fine at this size, and it buys a single
      // editable file per article instead of metadata duplicated in the
      // index. Revisit if this ever holds dozens of posts.
      .then(function (slugs) {
        return Promise.all(slugs.map(function (s) {
          return loadPost(s).catch(function (e) {
            console.warn('[blog] skipped', s, e.message);
            return null;
          });
        }));
      })
      .then(function (posts) {
        return posts.filter(Boolean).sort(function (a, b) {
          return (b.meta.date || '').localeCompare(a.meta.date || '');
        });
      });
  }

  /* ---------- views ---------- */

  var root = document.getElementById('blogRoot');
  if (!root) return;

  function meta(post) {
    var bits = [];
    if (post.meta.tag) bits.push('<span class="post__tag">' + escapeHtml(post.meta.tag) + '</span>');
    if (post.meta.date) bits.push('<span>' + prettyDate(post.meta.date) + '</span>');
    bits.push('<span>' + post.readingTime + ' min read</span>');
    // The separators are drawn by CSS as a ::before on each item after the
    // first, so a dot never gets left stranded at the end of a wrapped line
    // the way a standalone element between flex items does.
    return '<p class="post__meta">' + bits.join('') + '</p>';
  }

  function thumb(post, sizes) {
    return '<span class="postcard__thumb">' +
      '<img src="' + imageOf(post) + '" alt="" loading="lazy" decoding="async"' +
        (sizes ? ' sizes="' + sizes + '"' : '') + '>' +
    '</span>';
  }

  var ARROW = '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" ' +
    'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5"/></svg>';

  function card(post, variant) {
    var href = 'blog.html?post=' + encodeURIComponent(post.slug);
    var cls = 'postcard' + (variant ? ' postcard--' + variant : '');
    return '<li class="postlist__item' + (variant ? ' postlist__item--' + variant : '') + '">' +
      '<a class="' + cls + '" href="' + href + '">' +
        thumb(post, variant === 'lead' ? '(max-width: 940px) 100vw, 560px' : '(max-width: 940px) 100vw, 360px') +
        '<span class="postcard__body">' +
          meta(post) +
          '<h2 class="postcard__title">' + escapeHtml(post.meta.title || post.slug) + '</h2>' +
          (post.meta.excerpt ? '<p class="postcard__excerpt">' + escapeHtml(post.meta.excerpt) + '</p>' : '') +
          '<span class="postcard__more">Read' + ARROW + '</span>' +
        '</span>' +
      '</a>' +
    '</li>';
  }

  function renderIndex(posts) {
    document.title = 'Writing — Vital';

    if (!posts.length) {
      root.innerHTML = '<p class="blog__empty">No posts yet.</p>';
      return;
    }

    // Newest post carries the row on its own; the rest sit in the grid
    // beneath it. With one post there is no grid to draw.
    var lead = posts[0];
    var rest = posts.slice(1);

    root.innerHTML =
      '<header class="blog__head">' +
        '<p class="eyebrow">Writing</p>' +
        '<h1 class="blog__title">How Vital actually works</h1>' +
        '<p class="blog__lede">Method notes from the people building it — what we measure, ' +
          'how we test it, and what we will not claim.</p>' +
      '</header>' +
      '<ul class="postlist postlist--lead">' + card(lead, 'lead') + '</ul>' +
      (rest.length ? '<ul class="postlist postlist--grid">' + rest.map(function (p) {
        return card(p);
      }).join('') + '</ul>' : '');
  }

  function renderArticle(post) {
    var title = post.meta.title || post.slug;
    document.title = title + ' — Vital';

    if (post.meta.excerpt) {
      setMeta('meta[name="description"]', 'content', post.meta.excerpt);
      setMeta('meta[property="og:description"]', 'content', post.meta.excerpt);
    }
    setMeta('meta[property="og:title"]', 'content', title);
    setMeta('meta[property="og:type"]', 'content', 'article');
    setMeta('meta[property="og:image"]', 'content',
      new URL(imageOf(post), location.href).href);

    root.innerHTML =
      '<article class="post">' +
        '<a class="post__back" href="blog.html">' +
          '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" ' +
            'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
            '<path d="M13 8H4M7.5 4.5 4 8l3.5 3.5"/></svg>All writing</a>' +
        '<header class="post__head">' +
          meta(post) +
          '<h1 class="post__title">' + escapeHtml(title) + '</h1>' +
          (post.meta.excerpt ? '<p class="post__dek">' + escapeHtml(post.meta.excerpt) + '</p>' : '') +
        '</header>' +
        '<figure class="post__cover"><img src="' + imageOf(post) + '" alt="" decoding="async"></figure>' +
        '<div class="post__body">' + render(post.body) + '</div>' +
      '</article>';
  }

  function renderError(message) {
    root.innerHTML =
      '<div class="blog__empty">' +
        '<h1 class="blog__title">Not found</h1>' +
        '<p>' + escapeHtml(message) + '</p>' +
        '<p><a class="btn btn--primary" href="blog.html">All writing</a></p>' +
      '</div>';
  }

  var slug = new URLSearchParams(location.search).get('post');

  if (slug) {
    loadPost(slug).then(renderArticle).catch(function (e) {
      console.warn('[blog]', e);
      renderError('That post does not exist yet.');
    });
  } else {
    loadIndex().then(renderIndex).catch(function (e) {
      console.warn('[blog]', e);
      renderError('The post index could not be loaded.');
    });
  }
})();
