# Classical Gym — Frontend

Static frontend for the Classical Gym website. Contains a responsive landing page that lists membership plans, classes, and trainers and includes a simple join form that posts to the backend API.

How to run locally

1. Serve the folder using a static server. Example:

```powershell
npx serve . -l 3000
```

2. Open `http://localhost:3000` in your browser.

Notes
- Update `app.js` `API_BASE` if you host the backend remotely.
- Add `_redirects` for SPA routing when deploying to Netlify.
