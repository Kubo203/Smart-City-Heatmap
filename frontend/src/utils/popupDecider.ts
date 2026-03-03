// utils/popupDecider.ts
import type { ICON_PRESETS } from "@/const/filters";

export const shouldShowPopup = (tags: Record<string, string>): boolean => {
  // Elements that should NOT have detailed popups (simple/infrastructure)
  const noPopupTags: Record<string, string[]> = {
    // Transportation - usually don't need detailed info
    highway: ["bus_stop", "crossing", "traffic_signals", "street_lamp"],
    amenity: [
      "parking",
      "bench",
      "waste_basket",
      "post_box",
      "bicycle_parking",
    ],
    // Infrastructure
    power: ["pole", "tower", "generator"],
    waterway: ["stream", "ditch", "drain"],
    // Natural features
    natural: ["tree", "rock", "spring"],
    // Simple amenities
    leisure: ["playground"], // Some playgrounds might need info, but basic ones don't
  };

  // Check if this element should NOT have a popup
  for (const [key, values] of Object.entries(noPopupTags)) {
    if (key in tags && values.includes(tags[key])) {
      return false; // Don't show popup for this element
    }
  }

  // Elements that SHOULD have detailed popups
  const popupWorthyTags = [
    "amenity", // But we've already filtered some above
    "shop",
    "tourism",
    "historic",
    "leisure", // But we've filtered playgrounds above
    "office",
    "craft",
    "healthcare",
    "building", // Buildings often have useful info
  ];

  // Check if element has any of these significant tags (and wasn't filtered out)
  return popupWorthyTags.some((tag) => tag in tags);
};
export const getPopupData = (tags: Record<string, string>) => {
  const popupData: Record<string, string> = {};

  // Extract relevant information based on OSM tag conventions
  //   const extractors: Record<string, string[]> = {
  //     address: ["addr:street", "addr:housenumber", "addr:city", "addr:postcode"],
  //     contact: ["phone", "email", "website"],
  //     description: ["name", "description", "opening_hours", "operator"],
  //   };

  // Address information
  const street = tags["addr:street"];
  const houseNumber = tags["addr:housenumber"];
  const city = tags["addr:city"];
  const postcode = tags["addr:postcode"];

  if (street || city) {
    popupData.address = [street, houseNumber, city, postcode]
      .filter(Boolean)
      .join(", ");
  }

  // Contact information
  if (tags.website) popupData.website = tags.website;
  if (tags.phone) popupData.phone = tags.phone;
  if (tags.email) popupData.email = tags.email;

  // Basic info
  if (tags.name) popupData.name = tags.name;
  if (tags.opening_hours) popupData.openingHours = tags.opening_hours;
  if (tags.operator) popupData.operator = tags.operator;

  return popupData;
};

export const getElementIconType = (
  tags: Record<string, string>,
): keyof typeof ICON_PRESETS => {
  // Map OSM tags to your icon presets
  const iconMap: Record<string, keyof typeof ICON_PRESETS> = {
    // Transportation
    "highway=bus_stop": "bus",
    "amenity=bus_station": "bus",
    "amenity=bicycle_parking": "bike",
    "amenity=parking": "squareParking",

    // Education
    "amenity=school": "school",
    "amenity=university": "school",
    "amenity=library": "bookOpen",

    // Healthcare
    "amenity=hospital": "hospital",
    "amenity=clinic": "hospital",
    "amenity=pharmacy": "pill",

    // Leisure
    "leisure=playground": "volleyball",
    "leisure=sports_centre": "dumbbell",
    "leisure=park": "treeDeciduous",
    "leisure=garden": "treePalm",

    // Amenities
    "shop=supermarket": "shoppingCart",
    "amenity=restaurant": "utensils",
    "amenity=cafe": "coffee",
    "amenity=cinema": "film",
    "amenity=theatre": "theater",
    "tourism=attraction": "landmark",

    // Infrastructure
    waterway: "droplet",
    "amenity=fountain": "droplet",
  };

  // Try exact matches first
  for (const [key, value] of Object.entries(tags)) {
    const combined = `${key}=${value}`;
    if (iconMap[combined]) {
      return iconMap[combined];
    }
  }

  // Fallback based on main tag
  if (tags.amenity === "school") return "school";
  if (tags.amenity === "bus_station") return "bus";
  if (tags.leisure === "playground") return "volleyball";

  // Default
  return "landmark";
};
