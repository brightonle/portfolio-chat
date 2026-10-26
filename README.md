# portfolio-chat

My portfolio as a chat. As you scroll, each question types itself into the chat box, sends,
and a sun mascot answers with my experience, projects and education. Visitors can also type
their own questions.

Plain HTML, CSS and JavaScript. No framework and no build step.

## Run it locally

Either of these works:

- **VS Code Live Server:** install the recommended *Live Server* extension (VS Code will prompt you),
  then right-click `index.html` and choose **Open with Live Server**.
- **Terminal:** `npm run dev`, then open http://localhost:5173

Both reload the page when you save.

## Where things live

| File | What it holds |
| --- | --- |
| `js/profile.js` | All the content: `PROFILE` (jobs, projects, skills, links), `SCRIPT` (the order of questions), `ROUTES` (keywords that match typed questions to answers) |
| `js/app.js` | The chat engine: rendering, the scroll-triggered typing animation, the sun mascot, live questions |
| `css/styles.css` | All styling. Colors and fonts are tokens at the top in `:root` |
| `index.html` | Page shell: header, hero headline, composer |

To change the hero headline, edit the `<h1>` in `index.html`.
To add a new section: add data to `PROFILE`, a renderer to `RENDER` in `app.js`, an entry to
`SCRIPT`, and a keyword rule to `ROUTES`.

## Deploy

It's a static site, so Vercel deploys it as-is:

1. Push this folder to a new GitHub repo.
2. In Vercel, **Add New → Project**, import the repo, and keep the defaults (no build command).

## Next: a real AI

The chat currently answers with keyword matching. To make it a real model, add a Vercel
serverless function (`api/chat.js`) that sends the visitor's question plus `PROFILE` to the
Anthropic API, then have `ask()` in `app.js` call `/api/chat` and stream the reply into the
answer bubble. Keep the API key in a Vercel environment variable, never in the front-end code.
