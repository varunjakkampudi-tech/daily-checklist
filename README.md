# Daily Checklist

A lightweight, mobile-first personal productivity dashboard built with native HTML, CSS and JavaScript.

## Features

- One-tap completion and reopening
- Pending, completed and all-task views
- Category grouping, priorities, editing and deletion
- Live completion statistics
- Light and dark themes
- Browser-local persistence and JSON backup/import
- No visible calendar dates, dependencies or tracking

## Run locally

Serve the repository root with `python -m http.server 8000` and open http://localhost:8000.

## Deployment

In repository Settings → Pages, select Deploy from a branch, main, / (root), and Save. The intended site is https://varunjakkampudi-tech.github.io/daily-checklist/.

## Privacy and data model

The source is public; real task data must not be committed. Tasks stay in browser local storage. Export a JSON backup before clearing storage. The import format is an array of objects containing id, title, category, priority and done. Imports preserve existing IDs and completion states; new IDs add tasks. See tasks.example.json.

No authenticated backend, automatic private task delivery or cross-device synchronization is implemented. GitHub Pages is static public hosting. Daily private updates require a separate authenticated service or manual import.

## Verification

Manual acceptance: create a task, complete it, reopen it, edit it, reload, export, import, delete, toggle theme, and inspect narrow mobile layouts. Test with keyboard and VoiceOver before claiming accessibility conformance.

## Project layout

- index.html — standalone dashboard
- tasks.example.json — non-personal example dataset
- .nojekyll — static hosting configuration
- SECURITY.md — privacy and security guidance
