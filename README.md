# Vital — landing page

Static landing page for Vital, clinic software for dietitians. Plain HTML/CSS/JS, no build
step and no dependencies — open `index.html` or serve the folder.

```bash
python -m http.server 5173
```

## Structure

| File | What it holds |
| --- | --- |
| `index.html` | All page markup: header, hero (which holds the features), compliance, CTA, footer |
| `styles.css` | Full stylesheet, design tokens at the top under `:root` |
| `main.js` | Mobile nav, scroll reveal, feature tabs, viewport-gated video playback, demo form |
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

## One screen

The landing is a single section. `.hero` is `min-height: calc(100svh - --header-h)` and holds
both halves — proposition on the left, the product film on the right — so the first screen is
the whole pitch and nothing sits half-visible on the cut. `min-height`, not `height`: a short
or zoomed window is allowed to push past it rather than clip the film.

Two things keep it inside that box. The headline's `clamp` caps its `vw` term with a `9vh`
term, so a short window shrinks the type instead of shoving the film off the bottom; and
`.hero__features .media` carries a `max-height` measured against the viewport, so on a short
window the film's height leads and the frame simply gets narrower.

Below 940px the two columns cannot both hold a screen, so they stack and `min-height` drops
back to `0` — the section becomes as tall as its two halves rather than a viewport box they
overflow.

## The headline

`Your ultimate / patient relationship / platform`, broken with `<span class="hero__line">`
rather than `<br>` so the breaks are structural and survive a reflow. The middle line changes
voice — Instrument Serif italic in `--teal-deep`, against Inter 700 on either side of it —
which is the whole of the design; at this size a single face reads as a wall.

The 70px cap on `.hero__title` is measured, not chosen: it is the largest "Your ultimate" can
be set and still hold one line in a 453px column (~422px with tracking counted). Raise the cap
without widening the column and the first line breaks in two, which reads as ragged rather
than deliberate. The accent line is *meant* to wrap to two lines on desktop and fits on one at
full mobile width.

## Section two — how it works

Four horizontal rows under the hero, alternating sides, in `#how`. Three of them are one
patient journey — intake, response, booking — and the fourth is the guarantee running under all
three, which is why it takes the teal accent rather than the amber and hands off into Safety &
compliance directly below it.

Each row is four elements and no more: instrument chips, title, two lines, figure. The figures
are inline SVG built from the same tokens as the rest of the page.

**Branching happens between assessments, never inside one.** A PSQI global score needs all 19
of its items; skipping items returns a number no dietitian can use. So the product picks which
batteries to run and runs each in full, and row 01's figure shows exactly that — two selected,
one struck out and labelled *not run*. Any future copy here has to keep that distinction.

Instrument names on the page imply the clinic licenses and runs them faithfully. IPAQ, MEDAS
and SCOFF are freely published; PSQI needs a licence for commercial use; MNA is trademarked;
EAT-26 and TFEQ carry terms. Confirm before adding a chip.

The word *triage* is deliberately absent from row 03. Triage is a clinical act and the footer
promises clinical decisions stay with the dietitian.

## Section two animation

Each row's figure animates once, hooked to `.is-visible` — the class the existing `.reveal`
observer adds and never removes. Two rules make the whole set safe:

- Every figure's **resting state is its finished state**. Reduced motion, JS off, or an
  observer that never fires all show the completed drawing rather than an empty frame.
- Every initial state and every `animation` sits inside
  `@media (prefers-reduced-motion: no-preference)` and is gated on `.js`, so under `reduce`
  none of it applies and the base styles are what paint.

That is why the two travelling dots in row 02 carry their end `transform` in the base rule and
animate with `both` rather than `forwards` — with `forwards` they would rest at the start line
whenever motion was off.

## Feature media

All three clips share one frame — petrol mat, petrol hairline, warm drop shadow — and the
grading inside it is what varies. Two of the clips are dark renders and take the default
`screen` bloom; `assets/video/smart-scheduling.mp4` is a light warm render and carries
`.media--light`, which inverts the treatment to a `multiply` petrol scrim.

The clips map to the tabs by name: `Chat_feature_video.mp4` → Chat, `checklist_feature.mp4` →
Topics (the clinic ticking topics on and off), `smart-scheduling.mp4` → Schedule.

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
