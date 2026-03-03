/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { SearchResult } from "@/components/custom/filter/InputSearch";
import { type ICON_PRESETS } from "@/const/filters";
import {
  getElementIconType,
  shouldShowPopup,
} from "@/utils/popupDecider";
import type {
  BoundingBox,
  MapElement,
  MarkerInfo,
} from "@/utils/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { PopupContent } from "@/components/custom/map/PopupContent";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function buildMapQuery(
  filters: string[],
  location: { city?: string; bounds?: BoundingBox },
): string {
  const queryBlocks = filters.map((filter) => {
    const [key, value] = filter.split("=");
    if (location.city) {
      return `nwr["${key}"="${value}"](area);`;
    } else if (location.bounds) {
      const { south, west, north, east } = location.bounds;
      return `nwr["${key}"="${value}"](${south},${west},${north},${east});`;
    }
    return "";
  });

  const locationBlock = location.city ? `area["name"="${location.city}"];` : "";

  return `
  [out:json][timeout:25];
  ${locationBlock}
  (
    ${queryBlocks.join("\n  ")}
  );
  out center;
  `;
}

export function extractHeatmapPoints(
  data: MapElement[],
): [number, number, number][] {
  return data
    .map((el) => {
      const lat = el.lat ?? el.center?.lat;
      const lon = el.lon ?? el.center?.lon;
      if (lat && lon) return [lat, lon, 0.5]; // intensity
      return null;
    })
    .filter(Boolean) as [number, number, number][];
}

// Add this function to lib/utils.ts - Updated to match your ICON_PRESETS
export const getIconFromTags = (
  tags: Record<string, string> | undefined,
): keyof typeof ICON_PRESETS => {
  if (!tags) return "bus"; // Default icon (choose one that exists)

  // Check for specific OSM tags and map them to icons
  if (tags.amenity) {
    switch (tags.amenity) {
      case "school":
      case "kindergarten":
      case "university":
        return "school";
      case "hospital":
      case "clinic":
      case "doctors":
        return "hospital";
      case "restaurant":
      case "cafe":
      case "bar":
      case "fast_food":
        return "utensils";
      case "bus_station":
      case "bus_stop":
      case "tram_stop":
        return "bus";
      case "parking":
        return "squareParking";
      case "fuel":
        return "droplet";
      case "bank":
      case "atm":
        return "landmark";
      case "police":
        return "trafficCone";
      case "fire_station":
        return "droplet";
      case "pharmacy":
        return "pill";
      case "library":
        return "bookOpen";
      case "cinema":
        return "film";
      case "theatre":
        return "theater";
      case "museum":
        return "landmark";
      case "place_of_worship":
      case "church":
        return "landmark";
      case "post_office":
        return "landmark";
      default:
        return "bus";
    }
  }

  if (tags.shop) {
    return "shoppingCart";
  }

  if (tags.tourism) {
    switch (tags.tourism) {
      case "hotel":
      case "guest_house":
      case "hostel":
        return "landmark";
      case "attraction":
      case "museum":
        return "landmark";
      default:
        return "bus";
    }
  }

  if (tags.leisure) {
    switch (tags.leisure) {
      case "park":
        return "treePalm";
      case "playground":
        return "volleyball";
      case "swimming_pool":
        return "wavesLadder";
      case "sports_centre":
      case "fitness_centre":
        return "dumbbell";
      case "garden":
        return "treeDeciduous";
      default:
        return "bus";
    }
  }

  if (tags.highway) {
    switch (tags.highway) {
      case "bus_stop":
        return "bus";
      case "cycleway":
        return "bike";
      case "primary":
      case "secondary":
      case "tertiary":
        return "trafficCone";
      default:
        return "bus";
    }
  }

  if (tags.office) {
    return "landmark";
  }

  if (tags.historic) {
    return "landmark";
  }

  if (tags.natural) {
    if (tags.natural === "water") return "droplet";
    if (tags.natural === "tree") return "treeDeciduous";
  }

  if (tags.landuse) {
    if (tags.landuse === "forest") return "treeDeciduous";
    if (tags.landuse === "retail") return "shoppingCart";
    if (tags.landuse === "commercial") return "shoppingCart";
  }

  // Default icon - must match one of your ICON_PRESETS keys
  return "bus";
};

// lib/helper.ts - Update extractMarkers function

export function extractMarkers(elements: any[]): MarkerInfo[] {
  return elements.map((element) => {
    const tags = element.tags || {};

    // Get position based on element type
    let position: [number, number];
    if (element.type === "node") {
      position = [element.lat, element.lon];
    } else if (element.center) {
      position = [element.center.lat, element.center.lon];
    } else {
      position = [0, 0];
    }

    // Get icon type
    const iconType = getElementIconType(tags);

    // Build address from tags
    const address = [
      tags["addr:street"],
      tags["addr:housenumber"],
      tags["addr:city"],
      tags["addr:postcode"],
    ]
      .filter(Boolean)
      .join(", ") || undefined;

    // Create popup content using React component
    const showPopup = shouldShowPopup(tags);
    const popupContent = showPopup ? (
      <PopupContent tags={tags} address={address} />
    ) : undefined;

    return {
      id: element.id,
      position,
      name: tags.name || "Unnamed location",
      address,
      website: tags.website,
      icon: iconType,
      popupContent,
    };
  });
}

export const formatAddress = (result: SearchResult) => {
  const parts: string[] = [];
  const address = result.address || {};

  // Priority 1: Road with house number (most specific)
  if (address.road) {
    const roadPart = address.house_number
      ? `${address.road} ${address.house_number}`
      : address.road;
    parts.push(roadPart);
  }

  // Priority 2: Direct name if available and not already included
  if (result.name && !parts.some((part) => part.includes(result.name || ""))) {
    parts.push(result.name);
  }

  // Priority 3: Locality (city, town, village)
  const locality = address.city || address.town || address.village;
  if (locality && !parts.some((part) => part.includes(locality))) {
    parts.push(locality);
  }

  // Priority 4: Suburb or neighborhood (if different from locality)
  if (address.suburb && address.suburb !== locality) {
    parts.push(address.suburb);
  }

  // Priority 5: Postcode
  if (address.postcode) {
    parts.push(address.postcode);
  }

  // Priority 6: Country (only if not Slovakia)
  if (address.country && address.country_code !== "sk") {
    parts.push(address.country);
  }

  return parts.filter(Boolean).join(", ");
};

// In helper.ts - update the formatSearchResultAddress function
// In helper.ts - update the function signature to accept t parameter
export const formatSearchResultAddress = (
  result: SearchResult,
  t?: (key: string) => string,
): string => {
  const address = result.address || {};

  // For better address formatting
  const getDisplayName = () => {
    // If display_name exists and is reasonable, use a simplified version
    if (result.display_name) {
      // Split and take first meaningful parts
      const displayParts = result.display_name.split(",");

      // Remove country and redundant parts
      const meaningfulParts = displayParts.filter((part) => {
        const trimmed = part.trim();
        // Exclude country name, postcodes, etc.
        if (
          trimmed.includes("Slovakia") ||
          trimmed.match(/^\d{3}\s?\d{2}$/) || // Postcode pattern
          trimmed.includes("Region of") ||
          trimmed.includes("District of")
        ) {
          return false;
        }
        return trimmed.length > 0;
      });

      // Take first 2-3 meaningful parts
      const limitedParts = meaningfulParts.slice(0, 3);
      return limitedParts.map((part) => part.trim()).join(", ");
    }

    return null;
  };

  // Try to get a clean display name first
  const displayName = getDisplayName();
  if (displayName) {
    return displayName;
  }

  // Fallback: Road + House number
  if (address.road) {
    const roadDisplay = address.house_number
      ? `${address.road} ${address.house_number}`
      : address.road;

    // Add locality if different from road name
    const locality = address.city || address.town || address.village;
    if (locality && !roadDisplay.includes(locality)) {
      return `${roadDisplay}, ${locality}`;
    }
    return roadDisplay;
  }

  // Fallback: Use name
  if (result.name) {
    const locality = address.city || address.town || address.village;
    if (locality && result.name !== locality) {
      return `${result.name}, ${locality}`;
    }
    return result.name;
  }

  // Last resort: First part of display_name
  if (result.display_name) {
    return result.display_name.split(",")[0].trim();
  }

  // Use translation if available, otherwise default
  return t ? t("general.unknown") : "Unknown";
};

// Also, update the grouping function in InputSearch.tsx to be more intelligent:
export const groupSimilarResults = (
  results: SearchResult[],
): SearchResult[] => {
  const groups: Record<string, SearchResult[]> = {};

  results.forEach((result) => {
    const address = result.address || {};

    // Create a normalized key based on the most important parts
    let key = "";

    // For roads: use road + locality
    if (address.road && result.type?.includes("road")) {
      key = `road:${address.road}:${address.city || address.town || address.village || ""}`;
    }
    // For cities/towns: use name + country
    else if (
      result.type?.includes("city") ||
      result.type?.includes("town") ||
      result.type?.includes("village")
    ) {
      key = `place:${result.name || result.display_name?.split(",")[0]}:${address.country_code || ""}`;
    }
    // For administrative: use type + name
    else if (result.type?.includes("administrative")) {
      key = `admin:${result.name}:${address.state || address.country_code || ""}`;
    }
    // Fallback: use display_name
    else {
      key = result.display_name;
    }

    if (!groups[key]) groups[key] = [];
    groups[key].push(result);
  });

  // Return the best result from each group
  return Object.values(groups).map((group) => {
    // Sort by importance, then by specificity
    return group.sort((a, b) => {
      // First by importance
      const importanceDiff = (b.importance || 0) - (a.importance || 0);
      if (Math.abs(importanceDiff) > 0.1) return importanceDiff;

      // Then by type specificity (city > town > village > road)
      const typePriority = (type: string | undefined) => {
        if (!type) return 0;
        if (type.includes("city")) return 4;
        if (type.includes("town")) return 3;
        if (type.includes("village")) return 2;
        if (type.includes("road") || type.includes("street")) return 1;
        return 0;
      };

      return typePriority(b.type) - typePriority(a.type);
    })[0];
  });
};

// In helper.ts - add this function
export const translateOSMType = (
  type: string | undefined,
  t: (key: string) => string,
): string => {
  if (!type) return t("general.unknown");

  const lowerType = type.toLowerCase();

  // Map OSM types to translation keys
  const typeMap: Record<string, string> = {
    // Highway types
    residential: "general.residential",
    tertiary: "general.tertiary",
    highway: "general.highway",
    road: "general.road",
    street: "general.street",

    // Place types
    city: "general.city",
    town: "general.town",
    village: "general.village",
    hamlet: "general.hamlet",
    suburb: "general.suburb",
    quarter: "general.quarter",
    neighbourhood: "general.neighbourhood",

    // Administrative types
    administrative: "general.administrative",
    boundary: "general.boundary",
    district: "general.district",
    region: "general.region",
    state: "general.state",
    country: "general.country",

    // Building types
    house: "general.house",
    building: "general.building",

    // Default fallbacks
    yes: "general.residential", // "yes" often means residential in OSM
    commercial: "general.building",
    industrial: "general.building",
    retail: "general.building",
    apartments: "general.residential",
  };

  // Check for exact match first
  if (typeMap[lowerType]) {
    return t(typeMap[lowerType]);
  }

  // Check for partial matches
  for (const [key, translationKey] of Object.entries(typeMap)) {
    if (lowerType.includes(key)) {
      return t(translationKey);
    }
  }

  // Capitalize first letter for unknown types
  return type.charAt(0).toUpperCase() + type.slice(1);
};

export const calculateRadius = (
  boundingbox?: [string, string, string, string],
) => {
  if (!boundingbox) {
    return 0.005; // Default radius (~5km)
  }

  const [south, north, west, east] = boundingbox.map(parseFloat);

  // Calculate the span of the bounding box
  const latSpan = north - south;
  const lonSpan = east - west;

  // Use the larger span and add some padding
  const maxSpan = Math.max(latSpan, lonSpan);
  const radius = maxSpan / 2;

  // Set min and max bounds
  const minRadius = 0.005;
  const maxRadius = 0.15;

  return Math.max(minRadius, Math.min(maxRadius, radius));
};
