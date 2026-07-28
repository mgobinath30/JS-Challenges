// In production, the key would come from process.env or import.meta.env
export const API_CONFIG = {
  BASE_URL: "https://jonas.io",
  API_KEY: "cf51826b-1d05-471a-8b5a-6bb75ed8c221",
  TIMEOUT_SEC: 10,
};

import { API_CONFIG } from "./config.js";

/**
 * Fetches recipes matching a search query from the API.
 * @param {string} query - The recipe search term.
 * @param {AbortSignal} [signal] - Optional signal to abort the fetch request.
 * @returns {Promise<Object>} The parsed JSON data from the response.
 */
export async function fetchRecipesByQuery(query, signal) {
  const url = `${API_CONFIG.BASE_URL}/?search=${encodeURIComponent(query)}&key=${API_CONFIG.API_KEY}`;

  // Create a timeout controller to prevent indefinitely hanging requests
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(
    () => timeoutController.abort(),
    API_CONFIG.TIMEOUT_SEC * 1000,
  );

  // Link external abort signal if provided
  if (signal) {
    signal.addEventListener("abort", () => timeoutController.abort());
  }

  try {
    const response = await fetch(url, { signal: timeoutController.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return (await response.ok) ? response.json() : null;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      throw new Error("Request timed out or was cancelled.");
    }
    throw error;
  }
}

import { fetchRecipesByQuery } from "./recipeService.js";

// Scope elements within an initialization closure or module scope to prevent global pollution
const elements = {
  searchBtn: document.querySelector("#searchBtn"),
  searchText: document.querySelector("#search-recipe"),
  resultsContainer: document.querySelector("#results"), // Example container for state updates
};

// Senior Pattern: Keep track of the active request to completely eliminate race conditions
let activeAbortController = null;

async function handleSearch() {
  const query = elements.searchText.value.trim();

  // Optimization: Guard clause against empty, wasteful network requests
  if (!query) return;

  // Race Condition Fix: Cancel any ongoing identical request before spinning up a new one
  if (activeAbortController) {
    activeAbortController.abort();
  }

  activeAbortController = new AbortController();

  try {
    updateUIState("loading");

    const data = await fetchRecipesByQuery(query, activeAbortController.signal);

    updateUIState("success", data);
  } catch (error) {
    // Gracefully ignore requests that were intentionally aborted by the user/system
    if (error.message.includes("cancelled")) return;

    updateUIState("error", error.message);
  } finally {
    // Clean up reference if this specific request finished running
    if (activeAbortController?.signal.aborted === false) {
      activeAbortController = null;
    }
  }
}

/**
 * Central UI State Machine to replace destructive alerts with proper DOM feedback
 */
function updateUIState(state, payload = null) {
  switch (state) {
    case "loading":
      elements.searchBtn.disabled = true;
      console.log("Loading recipes...");
      break;
    case "success":
      elements.searchBtn.disabled = false;
      console.log("Data safely received:", payload);
      break;
    case "error":
      elements.searchBtn.disabled = false;
      console.error(`UI Notification: ${payload}`);
      break;
  }
}

// Event Bindings
elements.searchBtn.addEventListener("click", handleSearch);

// Accessibility (a11y) addition: trigger search on Enter key press
elements.searchText.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleSearch();
});
