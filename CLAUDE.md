# portfolio-chat

Static site (HTML/CSS/vanilla JS, no build). Content lives in js/profile.js; js/app.js renders it.

- Keep the page white (single light theme) and the sun mascot (sunSVG in app.js).
- Fonts: Newsreader (display), Geist (body), Geist Mono (labels). Tokens in :root of css/styles.css.
- Every answer is a `.turn`: `.ask` bubble + `.reply`. The first <p> of a reply streams in word by word;
  every later child gets `.rise` and slides in. Two phases per turn: playAsk() types the question into the
  composer and sends it when the turn scrolls into view (sun starts thinking); playAnswer() streams the reply only
  once it's scrolled past ANSWER_LINE. Speeds are in the TIMING object at the top of that section.
- Respect prefers-reduced-motion (everything renders instantly).
- Run locally with `npm run dev` (live-server on :5173).
