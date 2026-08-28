# Vital — landing page

Static landing page for Vital, clinic software for dietitians. Plain HTML/CSS/JS, no build
step and no dependencies — open `index.html` or serve the folder.

```bash
python -m http.server 5173
```

## Structure

| File | What it holds |
| --- | --- |
| `index.html` | All page markup: header, hero, three features, compliance, CTA, footer |
| `styles.css` | Full stylesheet, design tokens at the top under `:root` |
| `main.js` | Mobile nav, scroll reveal, viewport-gated video playback, demo form |
| `assets/video/` | Feature videos |
| `assets/img/` | Video posters |

## Design language

Pulled from the product films in `assets/video/`: warm amber ground, frosted-glass panels,
petrol/teal clinical accents. Tokens live in `:root` in `styles.css`.

Sampling the clips (hue histogram over their saturated pixels) puts them on two hues and only
two: amber at 20-30 degrees, and a petrol at 190-200 degrees. Both sides of the page are built
on that pair — the hero's cool bottom-right corner, the `--slate` video mat, and the `--teal`
accent all sit in the 190-200 band rather than merely near it.

The hero ground is four layers: a light bloom, the amber ramp, blurred blobs, then `.mesh`
(a 34px petrol measure, masked to the art side) and `.grain` (soft-light noise). The mesh is
the techy half of the brief and the grain is the lifestyle half; both are deliberately at the
threshold of noticeable.

## The fold

The hero is sized `100svh - --header-h - --fold-tail`, where `--fold-tail` is exactly the
features head, the tab rail, and a sliver of the panel below it. So the rail lands near the
bottom of the first screen at any window height, with the panel it controls already breaking
the fold — the tabs alone read as decoration, the sliver of panel is what says they do
something. Change `--fold-tail` and the hero resizes to match; don't set a hero height.

The rail is `position: sticky` beneath the header for the length of the section, so the
control stays put while the panels it switches are read. Clicking a tab scrolls the panel up
to meet the click, but never when it is already fully visible and never upward
(`revealStage()` in `main.js`).

## Feature media

All three clips share one frame — petrol mat, petrol hairline, warm drop shadow — and the
grading inside it is what varies. Two of the clips are dark renders and take the default
`screen` bloom; `assets/video/smart-scheduling.mp4` is a light warm render and carries
`.media--light`, which inverts the treatment to a `multiply` petrol scrim.

That last one is grading, not a fix: it is a different render style from the other two and no
overlay makes it the same one. Re-rendering it on the dark ground is what actually closes the
gap.

To swap in a different clip, keep the figure shape:

```html
<figure class="media">
  <video class="media__video"
         data-src="assets/video/agents.mp4"
         poster="assets/img/agents-poster.png"
         muted loop playsinline preload="none"
         aria-label="Describe what the video shows"></video>
  <div class="media__tint" aria-hidden="true"></div>
</figure>
```

`main.js` picks up any `.media__video` and plays it only while it is both the open panel and
on screen. Add `media--light` to the figure if the footage is a light render.

## Still to wire up

- The demo form in `main.js` validates the email and shows a confirmation; it does not POST
  anywhere yet. See the `TODO` in the submit handler.
- Compliance badges are HIPAA and GDPR — swap the copy in the `#compliance` section if the
  clinic-facing claims differ.
