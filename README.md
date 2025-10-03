# Seattle Sangat Seva

A simple static website to manage and generate a kirtan schedule for the Seattle Sangat. Built with plain HTML, Tailwind CSS (via CDN), minimal JavaScript, and a small custom stylesheet.

## What this project contains

- `index.html` — Main UI for selecting day/time, adding "Kirtan Vaari" items, viewing the generated text output, and copying it. Uses Tailwind utilities and includes icons via Feather Icons.
- `script.js` — Client-side JavaScript that implements the schedule logic and interactivity.
- `styles.css` — Optional custom styles for layout and theming.

## Quick start

You can open the site locally in any modern browser. No build step or server is required.

1. Clone or download the repository.
2. Open `index.html` in your browser (double-click or use your editor's Live Preview).

Optional: run a lightweight static server (useful for testing local fetches or service workers):

PowerShell example:

```powershell
# from the project root
python -m http.server 8000
# then visit http://localhost:8000 in your browser
```

If you prefer Node.js and have `http-server` installed:

```powershell
npx http-server -c-1 . -p 8000
# or if installed globally
http-server -c-1 . -p 8000
```

## Usage

- Select the Day and Start/End times at the top.
- Click "Add Kirtan Vaari" to append schedule items (use the UI to edit/remove entries).
- The generated text appears in the "Text Output" area where you can copy it with the Copy button.

## Development notes

- Tailwind CSS and Feather Icons are loaded from CDNs in `index.html`. For production or offline use, consider bundling these resources locally.
- Keep `script.js` and `styles.css` small and framework-free for easy portability.
