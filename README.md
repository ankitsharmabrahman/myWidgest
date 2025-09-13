
# accuknox-dashboard

This is a small React + Vite project implementing the **AccuKnox Frontend Trainee** assignment:
- JSON-driven dashboard with categories and widgets
- Add/remove widgets per category
- Global widget registry and search
- Assign/unassign widgets to categories using checkboxes
- Simple local state management using `useReducer`

## Files
- `index.html` - Vite entry
- `src/main.jsx` - React entry
- `src/App.jsx` - Main app implementing features
- `src/index.css` - Basic styles
- `package.json` - project config

## How to run locally

1. Install Node.js (>=16 recommended).
2. Open terminal in project folder.
3. Install dependencies:
   ```
   npm install
   ```
4. Run dev server:
   ```
   npm run dev
   ```
5. Open the printed localhost URL (e.g. http://localhost:5173)

## Build & Preview
```
npm run build
npm run preview
```

## What I implemented
- Dynamic categories & widgets from `initialJSON` inside `src/App.jsx`.
- Add widget modal/form which adds widget to a selected category and registers it globally.
- Remove widget via ✕ button on each widget card.
- Search across all widgets and assign/unassign to categories via checkbox list.
- README contains steps to run locally.

You can zip this folder or push to GitHub. If you'd like, I can:
- Prepare a GitHub-ready commit message and `.gitignore`
- Create a zip file for download (I already created one below)
