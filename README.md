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

Pulled from the product film in `assets/video/chat-onboarding.mp4`: warm amber ground,
frosted-glass panels, sage/teal clinical accents. Tokens live in `:root` in `styles.css`.

## Dropping in the two remaining videos

Features 02 (custom agents) and 03 (safety) currently render a styled placeholder. Each sits
in a `<figure class="media media--placeholder" data-slot="...">`. To swap in the real video,
replace the whole figure with the same shape used by feature 01:

```html
<figure class="media">
  <video class="media__video"
         src="assets/video/agents.mp4"
         poster="assets/img/agents-poster.png"
         muted loop playsinline preload="metadata"
         aria-label="Describe what the video shows"></video>
</figure>
```

`main.js` picks up any `.media__video` automatically and plays it only while it is on screen.

## Still to wire up

- The demo form in `main.js` validates the email and shows a confirmation; it does not POST
  anywhere yet. See the `TODO` in the submit handler.
- Compliance badges are HIPAA and GDPR — swap the copy in the `#compliance` section if the
  clinic-facing claims differ.
