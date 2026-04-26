/**
 * CineSearch — app.js
 * OMDB Movie Search SPA
 *
 * Code Structure:
 *   1. Constants & Configuration
 *   2. API Service
 *   3. localStorage Service
 *   4. UI Rendering
 *   5. UI State Helpers
 *   6. Filter Utilities
 *   7. Event Listeners & Bootstrap
 *
 * @author  CineSearch
 * @version 1.0.0
 */

'use strict';

/* ============================================================
   1. CONSTANTS & CONFIGURATION
   ============================================================ */

/**
 * IMPORTANT: Replace the value below with your free OMDB API key.
 * Register at: https://www.omdbapi.com/apikey.aspx (free tier)
 *
 * For GitHub Pages deployment, store the key directly here
 * (it is a public/free key, no sensitive data at risk).
 */
const CONFIG = {
  API_KEY: 'b7003d40',
  API_BASE_URL: 'https://www.omdbapi.com/',
  LS_KEY_QUERY: 'cinesearch_last_query',  // localStorage key for last search term
  LS_KEY_DATA: 'cinesearch_last_data',   // localStorage key for cached movie data
};

/* DOM element references — cached once for performance */
const DOM = {
  searchForm: document.getElementById('search-form'),
  searchInput: document.getElementById('search-input'),
  searchBtn: document.getElementById('search-btn'),

  filterType: document.getElementById('filter-type'),
  filterYear: document.getElementById('filter-year'),
  filterRating: document.getElementById('filter-rating'),
  clearFiltersBtn: document.getElementById('clear-filters-btn'),

  statusBanner: document.getElementById('status-banner'),
  resultsSection: document.getElementById('results-section'),
  loadingSkeleton: document.getElementById('loading-skeleton'),
  emptyState: document.getElementById('empty-state'),

  // Movie card fields
  movieTitle: document.getElementById('movie-title'),
  movieYear: document.getElementById('movie-year-val'),
  movieRuntime: document.getElementById('movie-runtime'),
  movieLanguage: document.getElementById('movie-language'),
  moviePlot: document.getElementById('movie-plot'),
  movieGenre: document.getElementById('movie-genre'),
  movieDirector: document.getElementById('movie-director'),
  movieWriter: document.getElementById('movie-writer'),
  movieActors: document.getElementById('movie-actors'),
  movieAwards: document.getElementById('movie-awards'),
  movieBoxoffice: document.getElementById('movie-boxoffice'),
  moviePoster: document.getElementById('movie-poster'),
  movieTypeBadge: document.getElementById('movie-type-badge'),
  movieRatingBadge: document.getElementById('movie-rating-badge'),
  ratingsRow: document.getElementById('ratings-row'),
};


/* ============================================================
   2. API SERVICE
   Purpose: All network communication with OMDB lives here.
   ============================================================ */

const ApiService = {
  /**
   * Fetches movie data from OMDB by title.
   * Uses the `&t=` endpoint which returns a single best-match.
   *
   * @param  {string} title - The movie title to search for.
   * @returns {Promise<Object>} Parsed JSON response from OMDB.
   * @throws {Error} If the network request fails.
   */
  async fetchByTitle(title) {
    // Validate the API key before making a request
    if (!CONFIG.API_KEY || CONFIG.API_KEY === 'your_api_key_here') {
      throw new Error('API_KEY_MISSING');
    }

    // Build the request URL
    const url = new URL(CONFIG.API_BASE_URL);
    url.searchParams.set('t', title.trim());
    url.searchParams.set('apikey', CONFIG.API_KEY);
    url.searchParams.set('plot', 'full'); // Request full plot

    // Fetch — no external libraries, pure Fetch API
    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`NETWORK_ERROR:${response.status}`);
    }

    const data = await response.json();
    return data;
  },
};


/* ============================================================
   3. LOCALSTORAGE SERVICE
   Purpose: Persist and retrieve the last search so that a page
   refresh restores the user's previous result automatically.

   Strategy:
   - On successful search → save (query + result JSON) to localStorage.
   - On page load       → read from localStorage and restore UI.
   - On "not found"     → do NOT overwrite the previous good result.
   ============================================================ */

const StorageService = {
  /**
   * Saves the last successful search query and its movie data.
   * Both are stored as separate keys so we can restore the input
   * field text independently of the full payload.
   *
   * @param {string} query     - The search string the user typed.
   * @param {Object} movieData - The full OMDB response object.
   */
  saveLastSearch(query, movieData) {
    try {
      localStorage.setItem(CONFIG.LS_KEY_QUERY, query);
      // Serialize the full object so we can restore without a network call
      localStorage.setItem(CONFIG.LS_KEY_DATA, JSON.stringify(movieData));
    } catch (err) {
      // localStorage may be unavailable in private/incognito mode
      console.warn('[StorageService] Could not write to localStorage:', err.message);
    }
  },

  /**
   * Retrieves the last saved search from localStorage.
   *
   * @returns {{ query: string|null, data: Object|null }}
   */
  getLastSearch() {
    try {
      const query = localStorage.getItem(CONFIG.LS_KEY_QUERY);
      const raw = localStorage.getItem(CONFIG.LS_KEY_DATA);
      const data = raw ? JSON.parse(raw) : null;
      return { query, data };
    } catch (err) {
      console.warn('[StorageService] Could not read from localStorage:', err.message);
      return { query: null, data: null };
    }
  },

  /** Clears the persisted search state. */
  clear() {
    try {
      localStorage.removeItem(CONFIG.LS_KEY_QUERY);
      localStorage.removeItem(CONFIG.LS_KEY_DATA);
    } catch (_) { /* silent */ }
  },
};


/* ============================================================
   4. UI RENDERING
   Purpose: All DOM mutation lives here. Keeps rendering logic
   decoupled from fetch/storage concerns.
   ============================================================ */

const UI = {
  /**
   * Renders the full movie card from an OMDB data object.
   *
   * @param {Object} movie - OMDB API response (Response === 'True').
   */
  renderMovie(movie) {
    // Helper to safely set text; falls back to '–' for N/A values
    const safeText = (val) => (!val || val === 'N/A') ? '–' : val;

    // Badges
    DOM.movieTypeBadge.textContent = safeText(movie.Type);
    DOM.movieRatingBadge.textContent = safeText(movie.Rated);

    // Core fields
    DOM.movieTitle.textContent = safeText(movie.Title);
    DOM.movieYear.textContent = safeText(movie.Year);
    DOM.movieRuntime.textContent = safeText(movie.Runtime);
    DOM.movieLanguage.textContent = safeText(movie.Language);
    DOM.moviePlot.textContent = safeText(movie.Plot);

    // Detail grid
    DOM.movieGenre.textContent = safeText(movie.Genre);
    DOM.movieDirector.textContent = safeText(movie.Director);
    DOM.movieWriter.textContent = safeText(movie.Writer);
    DOM.movieActors.textContent = safeText(movie.Actors);
    DOM.movieAwards.textContent = safeText(movie.Awards);
    DOM.movieBoxoffice.textContent = safeText(movie.BoxOffice);

    // Poster — use a fallback placeholder if OMDB returns 'N/A'
    if (movie.Poster && movie.Poster !== 'N/A') {
      DOM.moviePoster.src = movie.Poster;
      DOM.moviePoster.alt = `${movie.Title} poster`;
    } else {
      // Clean CSS-only placeholder
      DOM.moviePoster.src = this._generateFallbackPoster(movie.Title);
      DOM.moviePoster.alt = 'No poster available';
    }

    // Third-party ratings (IMDB, Rotten Tomatoes, Metacritic)
    this._renderRatings(movie.Ratings || []);

    // Update document title for SEO / browser tab
    document.title = `${movie.Title} (${movie.Year}) — CineSearch`;
  },

  /**
   * Renders the third-party ratings as chips.
   * @param {Array<{Source: string, Value: string}>} ratings
   */
  _renderRatings(ratings) {
    DOM.ratingsRow.innerHTML = '';
    if (!ratings.length) return;

    const sourceIcons = {
      'Internet Movie Database': '⭐',
      'Rotten Tomatoes': '🍅',
      'Metacritic': '🎮',
    };

    ratings.forEach(({ Source, Value }) => {
      const chip = document.createElement('div');
      chip.className = 'rating-chip';
      chip.innerHTML = `
        <span>${sourceIcons[Source] || '📊'}</span>
        <span class="rating-chip-source">${Source.replace('Internet Movie Database', 'IMDb')}</span>
        <span class="rating-chip-value">${Value}</span>
      `;
      DOM.ratingsRow.appendChild(chip);
    });
  },

  /**
   * Generates a minimal SVG data URI to use as a poster placeholder.
   * @param  {string} title - Movie title to display in the placeholder.
   * @returns {string} data: URI.
   */
  _generateFallbackPoster(title) {
    const initials = (title || '?')
      .split(' ')
      .slice(0, 2)
      .map(w => w[0])
      .join('')
      .toUpperCase();

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="280" height="380" viewBox="0 0 280 380">
        <rect width="280" height="380" fill="#1a1e2e"/>
        <text x="140" y="195" font-family="Inter,sans-serif" font-size="56" font-weight="800"
              fill="#7c6af7" text-anchor="middle" dominant-baseline="middle">${initials}</text>
        <text x="140" y="260" font-family="Inter,sans-serif" font-size="13" fill="#8890b0"
              text-anchor="middle">No Poster Available</text>
      </svg>
    `.trim();

    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  },
};


/* ============================================================
   5. UI STATE HELPERS
   Purpose: Control what is visible at any given moment.
   States: empty | loading | results | error
   ============================================================ */

const AppState = {
  /** Show the loading skeleton and hide everything else */
  showLoading() {
    DOM.emptyState.classList.add('hidden');
    DOM.resultsSection.classList.add('hidden');
    DOM.statusBanner.classList.add('hidden');
    DOM.loadingSkeleton.classList.remove('hidden');
    DOM.searchBtn.disabled = true;
    DOM.searchBtn.textContent = 'Searching…';
  },

  /** Show the movie card (results section) */
  showResults() {
    DOM.loadingSkeleton.classList.add('hidden');
    DOM.statusBanner.classList.add('hidden');
    DOM.emptyState.classList.add('hidden');
    DOM.resultsSection.classList.remove('hidden');
    DOM.searchBtn.disabled = false;
    DOM.searchBtn.textContent = 'Search';
  },

  /** Show a message banner with type: 'error' | 'warning' | 'info' */
  showMessage(text, type = 'error') {
    DOM.loadingSkeleton.classList.add('hidden');
    DOM.resultsSection.classList.add('hidden');
    DOM.emptyState.classList.add('hidden');

    DOM.statusBanner.className = `status-banner ${type}`;
    DOM.statusBanner.innerHTML = `<span>${type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'}</span> ${text}`;
    DOM.statusBanner.classList.remove('hidden');

    DOM.searchBtn.disabled = false;
    DOM.searchBtn.textContent = 'Search';
  },

  /** Restore the initial empty state */
  showEmpty() {
    DOM.loadingSkeleton.classList.add('hidden');
    DOM.resultsSection.classList.add('hidden');
    DOM.statusBanner.classList.add('hidden');
    DOM.emptyState.classList.remove('hidden');
    DOM.searchBtn.disabled = false;
    DOM.searchBtn.textContent = 'Search';
    document.title = 'CineSearch — Movie Discovery Engine';
  },
};


/* ============================================================
   6. FILTER UTILITIES
   Purpose: Populate the Year filter dropdown dynamically and
   handle the "Clear" button. These are UI placeholders—
   filtering against OMDB would require the search endpoint
   (?s=) which returns lists; wired up for future extension.
   ============================================================ */

const Filters = {
  /** Populate the year dropdown from current year back to 1888 */
  populateYearDropdown() {
    const currentYear = new Date().getFullYear();
    const frag = document.createDocumentFragment();

    for (let y = currentYear; y >= 1888; y--) {
      const opt = document.createElement('option');
      opt.value = y;
      opt.textContent = y;
      frag.appendChild(opt);
    }
    DOM.filterYear.appendChild(frag);
  },

  /** Reset all filter dropdowns to their default values */
  clearAll() {
    DOM.filterType.value = '';
    DOM.filterYear.value = '';
    DOM.filterRating.value = '';
  },
};


/* ============================================================
   7. MAIN CONTROLLER
   Purpose: Orchestrates search flow — fetch → render → persist.
   ============================================================ */

const App = {
  /**
   * The central search handler.
   * Coordinates: input validation → loading state → API call →
   * error handling → UI render → localStorage save.
   *
   * @param {string} title - The movie title to search.
   */
  async search(title) {
    const trimmed = title.trim();
    if (!trimmed) {
      AppState.showMessage('Please enter a movie title to search.', 'warning');
      return;
    }

    // 1. Show skeleton while the request is in-flight
    AppState.showLoading();

    try {
      // 2. Fetch from OMDB API (see ApiService above)
      const data = await ApiService.fetchByTitle(trimmed);

      // 3a. OMDB returns Response: "False" when nothing is found
      if (data.Response === 'False') {
        const reason = data.Error || 'Movie not found.';
        AppState.showMessage(`🎬 ${reason} Try a different title.`, 'warning');
        return;
      }

      // 3b. Render the movie card
      UI.renderMovie(data);
      AppState.showResults();

      /**
       * 4. Persist to localStorage.
       * We save BOTH the search query and the full API response.
       * This means on refresh we can restore the result WITHOUT
       * making a new network request — instant and offline-friendly.
       */
      StorageService.saveLastSearch(trimmed, data);

    } catch (err) {
      // 5. Error handling — distinguish between known error codes and unknowns
      if (err.message === 'API_KEY_MISSING') {
        AppState.showMessage(
          'API key is missing or invalid. Open <code>app.js</code> and set your OMDB key in <code>CONFIG.API_KEY</code>.',
          'error'
        );
      } else if (err.message.startsWith('NETWORK_ERROR')) {
        AppState.showMessage(
          'Network error — could not reach the OMDB API. Check your internet connection and try again.',
          'error'
        );
      } else {
        AppState.showMessage(
          'An unexpected error occurred. Please try again.',
          'error'
        );
        console.error('[App.search]', err);
      }
    }
  },

  /**
   * Restore last session from localStorage on page load.
   *
   * Checks for saved query + data. If both exist, restores them
   * directly from cache (no network call needed), then populates
   * the search input so the user knows what is displayed.
   */
  restoreLastSession() {
    const { query, data } = StorageService.getLastSearch();

    if (query && data) {
      DOM.searchInput.value = query;
      UI.renderMovie(data);
      AppState.showResults();

      // Subtle info banner so the user knows this is a cached result
      // We display it briefly then let the results take over
      console.info(`[App] Restored last search: "${query}" from localStorage`);
    } else {
      AppState.showEmpty();
    }
  },

  /** Wire up all event listeners */
  init() {
    // Populate dynamic filter dropdowns
    Filters.populateYearDropdown();

    // Restore previous session (localStorage → UI)
    this.restoreLastSession();

    // ── Search form submit ──
    DOM.searchForm.addEventListener('submit', (e) => {
      e.preventDefault(); // Prevent page refresh
      App.search(DOM.searchInput.value);
    });

    // ── Clear filters button ──
    DOM.clearFiltersBtn.addEventListener('click', () => {
      Filters.clearAll();
    });

    // ── Search input: clear error banner when user starts typing ──
    DOM.searchInput.addEventListener('input', () => {
      if (!DOM.statusBanner.classList.contains('hidden')) {
        DOM.statusBanner.classList.add('hidden');
        if (DOM.resultsSection.classList.contains('hidden') &&
          DOM.loadingSkeleton.classList.contains('hidden')) {
          DOM.emptyState.classList.remove('hidden');
        }
      }
    });

    // ── Filter selects: show info toast that filters are UI placeholders ──
    [DOM.filterType, DOM.filterYear, DOM.filterRating].forEach(select => {
      select.addEventListener('change', () => {
        if (select.value) {
          AppState.showMessage(
            `Filter <strong>${select.id.replace('filter-', '')}</strong> is a UI placeholder. ` +
            `Filtering is applied on future multi-result search (OMDB <code>?s=</code> endpoint).`,
            'info'
          );
          setTimeout(() => DOM.statusBanner.classList.add('hidden'), 4000);
        }
      });
    });
  },
};


/* ============================================================
   BOOTSTRAP
   DOMContentLoaded ensures the DOM is ready before we query it.
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => App.init());
