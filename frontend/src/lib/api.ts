/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { UserPreferences } from "@/utils/types";
import { getCurrentUser } from "./auth";

// localStorage key for user preferences
const PREFERENCES_STORAGE_KEY = "user_preferences";

/**
 * Helper function to get storage key for user preferences
 */
async function getStorageKey(userId?: string): Promise<string> {
  let userIdToUse = userId;
  if (!userIdToUse) {
    try {
      const user = await getCurrentUser();
      userIdToUse = user.id;
    } catch (error) {
      console.warn("Could not get current user ID, using default storage key");
      userIdToUse = "default";
    }
  }
  return `${PREFERENCES_STORAGE_KEY}_${userIdToUse}`;
}

export async function fetchMapData(query: string): Promise<any> {
  const endpoint = "https://overpass-api.de/api/interpreter";
  let tries = 0;
  const maxTries = 5;

  while (tries < maxTries) {
    tries++;
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: query,
      });

      if (response.status === 429) {
        // Too many requests
        const retryAfter =
          parseInt(response.headers.get("Retry-After") || "5", 10) * 1000;
        await new Promise((r) => setTimeout(r, retryAfter));
        continue;
      }

      if (!response.ok)
        throw new Error(`Overpass API error: ${response.statusText}`);

      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch {
        throw new Error("Non-JSON response from Overpass API:\n" + text);
      }
    } catch (error) {
      if (tries >= maxTries) throw error;
      await new Promise((r) => setTimeout(r, 1000 * tries));
    }
  }
  throw new Error("Repeated Overpass API failures");
}

// Note: Backend API sync is commented out - preferences are stored in localStorage only
// const API_BASE = 'http://localhost:8000/api/v1'; // Uncomment if you want to sync to backend
// import { getAuthHeaders } from "./auth"; // Uncomment if you want to sync to backend

/**
 * Save user location to localStorage
 * Merges with existing preferences to preserve filters
 * @param location - Selected location object with name, lat, lon, and optional boundingbox
 * @param userId - Optional user ID. If not provided, attempts to get from current user
 */
export async function saveUserLocation(
  location: {
    name: string;
    lat: string;
    lon: string;
    boundingbox?: [string, string, string, string];
  },
  userId?: string,
): Promise<UserPreferences> {
  try {
    const storageKey = await getStorageKey(userId);

    // Get existing preferences to preserve filters
    const existing = localStorage.getItem(storageKey);
    const existingPrefs: UserPreferences | null = existing
      ? JSON.parse(existing)
      : null;

    const preferences: UserPreferences = {
      filters: existingPrefs?.filters || [],
      location,
      updatedAt: new Date().toISOString(),
    };

    // Store in localStorage
    localStorage.setItem(storageKey, JSON.stringify(preferences));

    return preferences;
  } catch (error) {
    console.error("Save location failed:", error);
    throw error;
  }
}

/**
 * Save user filters to localStorage
 * Merges with existing preferences to preserve location
 * @param filters - Array of selected filter IDs
 * @param userId - Optional user ID. If not provided, attempts to get from current user
 */
export async function saveUserFilters(
  filters: string[],
  userId?: string,
): Promise<UserPreferences> {
  try {
    const storageKey = await getStorageKey(userId);

    // Get existing preferences to preserve location
    const existing = localStorage.getItem(storageKey);
    const existingPrefs: UserPreferences | null = existing
      ? JSON.parse(existing)
      : null;

    const preferences: UserPreferences = {
      filters,
      location: existingPrefs?.location || {
        name: "Košice",
        lat: "48.716385",
        lon: "21.261074",
      },
      updatedAt: new Date().toISOString(),
    };

    // Store in localStorage
    localStorage.setItem(storageKey, JSON.stringify(preferences));

    return preferences;
  } catch (error) {
    console.error("Save filters failed:", error);
    throw error;
  }
}

/**
 * Save user preferences to localStorage (filters and location)
 * Convenience function that saves both at once
 * @param filters - Array of selected filter IDs
 * @param location - Selected location object with name, lat, lon, and optional boundingbox
 * @param userId - Optional user ID. If not provided, attempts to get from current user
 */
export async function saveUserPreferences(
  filters: string[],
  location: {
    name: string;
    lat: string;
    lon: string;
    boundingbox?: [string, string, string, string];
  },
  userId?: string,
): Promise<UserPreferences> {
  try {
    const storageKey = await getStorageKey(userId);

    const preferences: UserPreferences = {
      filters,
      location,
      updatedAt: new Date().toISOString(),
    };

    // Store in localStorage
    localStorage.setItem(storageKey, JSON.stringify(preferences));

    // Optionally also save to backend (uncomment if you want to sync)
    /*
    try {
      const response = await fetch(`${API_BASE}/preferences`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(preferences),
      });

      if (!response.ok) {
        console.warn('Failed to sync preferences to backend:', response.status);
      }
    } catch (error) {
      console.warn('Failed to sync preferences to backend:', error);
    }
    */

    return preferences;
  } catch (error) {
    console.error("Save preferences failed:", error);
    throw error;
  }
}

/**
 * Get user preferences from localStorage (filters and location)
 * Preferences are retrieved per user based on their user ID
 * @param userId - Optional user ID. If not provided, attempts to get from current user
 */
export async function getUserPreferences(
  userId?: string,
): Promise<UserPreferences | null> {
  try {
    const storageKey = await getStorageKey(userId);
    const stored = localStorage.getItem(storageKey);

    if (!stored) {
      // Optionally try to fetch from backend if not in localStorage (uncomment if you want fallback)
      /*
      try {
        const response = await fetch(`${API_BASE}/preferences`, {
          headers: getAuthHeaders(),
        });

        if (response.ok) {
          const backendPrefs = await response.json();
          // Cache it in localStorage for next time
          localStorage.setItem(storageKey, JSON.stringify(backendPrefs));
          return backendPrefs;
        }
      } catch (error) {
        console.warn('Could not fetch preferences from backend:', error);
      }
      */
      return null; // No preferences found
    }

    return JSON.parse(stored) as UserPreferences;
  } catch (error) {
    console.error("Get preferences failed:", error);
    return null;
  }
}

/**
 * Clear user preferences from localStorage
 * @param userId - Optional user ID. If not provided, attempts to get from current user
 */
export async function clearUserPreferences(userId?: string): Promise<void> {
  try {
    const storageKey = await getStorageKey(userId);
    localStorage.removeItem(storageKey);
  } catch (error) {
    console.error("Clear preferences failed:", error);
  }
}
