# Style Lab

A responsive front-page design playground inspired by the styles shown in [this Instagram reel](https://www.instagram.com/reel/DdMUB4kskYv/). One fictional studio page is rendered in 22 independent design systems so you can compare typography, surfaces, spacing, and interactions without changing the content.

## Run locally

Requires Node.js for the CSS build and Python 3 for the simple static server. There are no package dependencies.

```sh
node build.mjs
python3 -m http.server 3000 --bind 0.0.0.0 --directory public
```

Open `http://localhost:3000` in your browser. Re-run `node build.mjs` after editing a source stylesheet.

## Controls

The fixed bottom bar provides previous/next arrows, a horizontally scrollable style rail, and an **All styles** picker. On phones the active style name and index remain visible above the rail. Left and right arrow keys cycle styles while a switcher control has keyboard focus. Escape closes the style picker, whose keyboard focus stays within the dialog.

The chosen style is saved in local storage. A `?s=style-id` URL selects that style directly. Switching happens without reloading the page.

## Files

| Path | Responsibility |
| --- | --- |
| `public/index.html` | Shared page content and navigation |
| `public/app.js` | Style registry, fonts, persistence, URL state, controls |
| `src/styles/00-base.css` | Common structural styles and design tokens |
| `src/styles/<style-id>.css` | One independent, scoped design system |
| `src/styles/zz-controls.css` | Shared responsive and accessibility safeguards |
| `build.mjs` | Concatenates the CSS into `public/styles.css` |
| `public/manus-routes.json` | Single-page route manifest |

## Included styles

Claymorphism, Cybercore, Neo-brutalism, Scrapbook, Surrealism, Y2K aesthetic, Pixel art, Synthwave, Glassmorphism, Neumorphism, Bento grid, Editorial design, Swiss design, Minimalism, Maximalism, Luxury typography, Conceptual sketch, Ethereal, Bohemian, Victorian, Cyberpunk, and Wabi-sabi.

These are working interpretations of the reel's style categories, not pixel-for-pixel copies of the websites shown. The studio name, product metrics, testimonials, and email address are demonstration content rather than real business claims.

## Dependencies and privacy

The site is static and has no backend, database, accounts, or analytics code of its own. Google Fonts are loaded as needed, with system fallbacks. Font downloads require internet access and may cause a short font swap the first time a style is opened. Adjacent styles are warmed in advance to reduce that delay. Visual state is only stored locally in the browser.
