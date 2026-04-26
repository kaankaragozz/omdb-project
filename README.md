# 🎬 CineSearch — Movie Discovery Engine

A sleek, dark-themed **Single Page Application (SPA)** built with vanilla HTML, CSS, and JavaScript that lets you search for any movie using the [OMDb API](https://www.omdbapi.com/) — no page reloads, no frameworks.

---

## ✨ Features

- **Instant movie search** — type a title and get full details with a single click
- **Rich movie card** — displays title, year, runtime, language, plot, genre, director, writer, actors, awards, box office revenue, and poster
- **Third-party ratings** — IMDb, Rotten Tomatoes, and Metacritic scores rendered as chips
- **Filter bar** — UI filters for Type, Year, and Rating (wired for future multi-result search via the `?s=` endpoint)
- **Session persistence** — last successful search is saved in `localStorage` and restored on page refresh without any extra network call
- **Loading skeleton** — animated placeholder while the API request is in-flight
- **Graceful error handling** — distinct messages for "not found", network failures, and missing API key
- **Fallback poster** — SVG placeholder with movie initials when OMDb returns no image
- **Responsive design** — works across desktop, tablet, and mobile
- **Accessible markup** — semantic HTML5, ARIA roles, and live regions

---

## 🛠️ Tech Stack

| Layer      | Technology                       |
|------------|----------------------------------|
| Markup     | HTML5 (semantic)                 |
| Styling    | Vanilla CSS3 (custom properties, flexbox, grid, animations) |
| Logic      | Vanilla JavaScript (ES2020, `'use strict'`) |
| Fonts      | [Inter](https://fonts.google.com/specimen/Inter) via Google Fonts |
| API        | [OMDb API](https://www.omdbapi.com/) |
| Deployment | GitHub Pages                     |

---

## 📂 Project Structure

```
omdb-project/
├── index.html   # App shell & all UI markup
├── style.css    # Design system, components, animations
└── app.js       # All JS logic (API, storage, rendering, state)
```

### `app.js` Module Breakdown

| Module          | Responsibility                                      |
|-----------------|-----------------------------------------------------|
| `CONFIG`        | API key, base URL, and localStorage key constants   |
| `DOM`           | Cached element references (queried once on load)    |
| `ApiService`    | Fetches movie data from OMDb (`fetch` API)          |
| `StorageService`| Reads/writes last search to `localStorage`         |
| `UI`            | Renders movie card and rating chips to the DOM      |
| `AppState`      | Controls visible UI state (loading / results / error / empty) |
| `Filters`       | Populates dynamic year dropdown; clears filters     |
| `App`           | Orchestrates the search flow; wires all event listeners |

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/kaankaragozz/omdb-project.git
cd omdb-project
```

### 2. Get a free OMDb API key

Register at [https://www.omdbapi.com/apikey.aspx](https://www.omdbapi.com/apikey.aspx) — the free tier allows 1,000 requests/day.

### 3. Set your API key

Open `app.js` and update the `CONFIG` object at the top of the file:

```js
const CONFIG = {
  API_KEY: 'your_api_key_here',  // ← replace this
  ...
};
```

### 4. Open locally

Because the project is pure HTML/CSS/JS, you can open `index.html` directly in any modern browser — or use a local server:

```bash
npx serve .
```

---

## 🌐 Deployment (GitHub Pages)

1. Push your repository to GitHub.
2. Go to **Settings → Pages**.
3. Under **Source**, select the `main` branch and `/ (root)`.
4. Click **Save** — your app will be live at `https://<username>.github.io/omdb-project/`.

> **Note:** The OMDb API key is embedded directly in `app.js`. Since the free tier key has no sensitive billing data, this is acceptable for GitHub Pages deployment.

---

## 📋 Requirements Fulfilled

| Requirement                                   | Status |
|-----------------------------------------------|--------|
| Movie search by title (no page reload)        | ✅     |
| Display title, year, genre, director, poster  | ✅     |
| Error handling for API failures & not found   | ✅     |
| Multiple searches without page refresh        | ✅     |
| Last search restored after page refresh       | ✅ (localStorage) |
| Responsive Single Page Application            | ✅     |
| Deployed via GitHub Pages                     | ✅     |
| Bonus: filter bar UI                          | ✅     |
| Bonus: third-party ratings chips              | ✅     |
| Bonus: loading skeleton animation             | ✅     |
| Bonus: SVG fallback poster                    | ✅     |

---

## 📄 License

This project was built as an academic assignment. All movie data is provided by the [OMDb API](https://www.omdbapi.com/). Rights to individual movie content remain with their respective owners.
