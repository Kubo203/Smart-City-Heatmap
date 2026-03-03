/* eslint-disable react-refresh/only-export-components */
import {
  Bike,
  BookOpen,
  Bus,
  Coffee,
  Droplet,
  Dumbbell,
  Film,
  Hospital,
  Landmark,
  Pill,
  School,
  ShoppingCart,
  SquareParking,
  Theater,
  TrafficCone,
  TreeDeciduous,
  TreePalm,
  Utensils,
  Volleyball,
  WavesLadder,
  Home,
  MapPin,
  Building,
} from "lucide-react";

import type { TFunction } from "i18next";
import type { SearchResult } from "@/components/custom/filter/InputSearch";

// Map OSM types to React icon components for the dropdown
export const getSearchResultIconComponent = (result: SearchResult) => {
  const type = result.type?.toLowerCase() || "";
  const classType = result.class?.toLowerCase() || "";
  const address = result.address || {};

  // Handle "yes" type - usually means residential
  if (type === "yes" || classType === "yes") {
    return Home;
  }

  // First check OSM class
  if (classType === "boundary") {
    if (type.includes("city") || address.city) return Landmark;
    if (type.includes("town") || address.town) return Landmark;
    if (type.includes("village") || address.village) return TreeDeciduous;
    if (type.includes("administrative")) return Landmark;
  }

  // Then check specific types
  if (type.includes("city") || address.city) return Landmark;
  if (type.includes("town") || address.town) return Landmark;
  if (type.includes("village") || address.village) return TreeDeciduous;
  if (type.includes("street") || type.includes("road") || address.road)
    return TrafficCone;
  if (type.includes("building") || type.includes("house") || type === "yes")
    return Building;
  if (type.includes("administrative")) return Landmark;

  // For highway types
  if (classType === "highway") {
    return TrafficCone;
  }

  // For place types
  if (classType === "place") {
    if (type.includes("city") || type.includes("town")) return Landmark;
    if (type.includes("village") || type.includes("hamlet"))
      return TreeDeciduous;
    return MapPin;
  }

  // For "TUKE" type searches (villages in other countries)
  if (result.name?.toLowerCase().includes("tuke")) return TreeDeciduous;

  // Default fallback
  return MapPin;
};

// Map OSM types to ICON_PRESETS keys (use only existing keys)
export const getSearchResultIcon = (
  result: SearchResult,
): keyof typeof ICON_PRESETS => {
  const type = result.type?.toLowerCase() || "";
  const classType = result.class?.toLowerCase() || "";
  const address = result.address || {};

  // Handle "yes" type - usually means residential
  if (type === "yes" || classType === "yes") {
    return "home"; // Use "home" if it exists, otherwise fallback
  }

  // First check OSM class
  if (classType === "boundary") {
    if (type.includes("city") || address.city) return "landmark";
    if (type.includes("town") || address.town) return "landmark";
    if (type.includes("village") || address.village) return "treeDeciduous";
    if (type.includes("administrative")) return "landmark";
  }

  // Then check specific types
  if (type.includes("city") || address.city) return "landmark";
  if (type.includes("town") || address.town) return "landmark";
  if (type.includes("village") || address.village) return "treeDeciduous";
  if (type.includes("street") || type.includes("road") || address.road)
    return "trafficCone";
  if (type.includes("building") || type.includes("house") || type === "yes")
    return "home";
  if (type.includes("administrative")) return "landmark";

  // For highway types
  if (classType === "highway") {
    if (type.includes("residential")) return "trafficCone";
    if (type.includes("tertiary")) return "trafficCone";
    return "trafficCone";
  }

  // For place types
  if (classType === "place") {
    if (type.includes("city") || type.includes("town")) return "landmark";
    if (type.includes("village") || type.includes("hamlet"))
      return "treeDeciduous";
    return "mapPin";
  }

  // For "TUKE" type searches (villages in other countries)
  if (result.name?.toLowerCase().includes("tuke")) return "treeDeciduous";

  // Default fallback - use "mapPin" which should exist
  return "mapPin";
};

export const getFilterSections = (t: TFunction) => {
  const MOCK_CATEGORIES = {
    mobility: [
      { label: t("filter.busstop"), value: "highway=bus_stop", icon: <Bus /> },
      {
        label: t("filter.infrastructure"),
        value: "highway=primary",
        icon: <TrafficCone />,
      },
      {
        label: t("filter.parking"),
        value: "amenity=parking",
        icon: <SquareParking />,
      },
      {
        label: t("filter.cycleway"),
        value: "highway=cycleway",
        icon: <Bike />,
      },
    ],
    civic: [
      { label: t("filter.school"), value: "amenity=school", icon: <School /> },
      {
        label: t("filter.kindergarten"),
        value: "amenity=kindergarten",
        icon: <School />,
      },
      {
        label: t("filter.hospital"),
        value: "amenity=hospital",
        icon: <Hospital />,
      },
      {
        label: t("filter.pharmacy"),
        value: "amenity=pharmacy",
        icon: <Pill />,
      },
      {
        label: t("filter.playground"),
        value: "leisure=playground",
        icon: <Volleyball />,
      },
      {
        label: t("filter.library"),
        value: "amenity=library",
        icon: <BookOpen />,
      },
    ],
    environment: [
      { label: t("filter.park"), value: "leisure=park", icon: <TreePalm /> },
      //{ label: t("filter.grass"), value: "landuse=grass", icon: <Leaf /> },
      {
        label: t("filter.forest"),
        value: "landuse=forest",
        icon: <TreeDeciduous />,
      },
      { label: t("filter.water"), value: "natural=water", icon: <Droplet /> },
    ],
    leisure: [
      {
        label: t("filter.retail"),
        value: "landuse=retail",
        icon: <ShoppingCart />,
      },
      {
        label: t("filter.restaurant"),
        value: "amenity=restaurant",
        icon: <Utensils />,
      },
      { label: t("filter.cafe"), value: "amenity=cafe", icon: <Coffee /> },
      {
        label: t("filter.fitness_centre"),
        value: "leisure=fitness_centre",
        icon: <Dumbbell />,
      },
      {
        label: t("filter.swimming_pool"),
        value: "leisure=swimming_pool",
        icon: <WavesLadder />,
      },
      {
        label: t("filter.sports_centre"),
        value: "leisure=sports_centre",
        icon: <Volleyball />,
      },
      { label: t("filter.cinema"), value: "amenity=cinema", icon: <Film /> },
      {
        label: t("filter.theatre"),
        value: "amenity=theatre",
        icon: <Theater />,
      },
      {
        label: t("filter.museum"),
        value: "tourism=museum",
        icon: <Landmark />,
      },
    ],
    // risks: [
    //   { label: t("filter.industrial"), value: "landuse=industrial", icon: <Factory /> },
    //   { label: t("filter.busy_road"), value: "highway=trunk", icon: <Car /> },
    //   { label: t("filter.railway"), value: "railway=rail", icon: <Train /> },
    // ],
  };

  const FILTER_SECTIONS = [
    { placeholder: t("filter.mobility"), options: MOCK_CATEGORIES.mobility },
    { placeholder: t("filter.civic"), options: MOCK_CATEGORIES.civic },
    {
      placeholder: t("filter.environment"),
      options: MOCK_CATEGORIES.environment,
    },
    { placeholder: t("filter.leisure"), options: MOCK_CATEGORIES.leisure },
    // { placeholder: t("filter.risks"), options: MOCK_CATEGORIES.risks },
  ];

  return FILTER_SECTIONS;
};

// Update ICON_PRESETS to properly use parameters
const ICON_PRESETS = {
  // Mobility
  bus: (color: string, size = 32) => `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${
      size / 16
    }" stroke-linecap="round" stroke-linejoin="round">
      <path d="M8 6v6"/>
      <path d="M15 6v6"/>
      <path d="M2 12h19.6"/>
      <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/>
      <circle cx="7" cy="18" r="2"/>
      <path d="M9 18h5"/>
      <circle cx="16" cy="18" r="2"/>
    </svg>
  `,
  trafficCone: (color: string, size = 32) => `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${
      size / 16
    }" stroke-linecap="round" stroke-linejoin="round">
      <path d="M16.05 10.966a5 2.5 0 0 1-8.1 0"/>
      <path d="m16.923 14.049 4.48 2.04a1 1 0 0 1 .001 1.831l-8.574 3.9a2 2 0 0 1-1.66 0l-8.574-3.91a1 1 0 0 1 0-1.83l4.484-2.04"/>
      <path d="M16.949 14.14a5 2.5 0 1 1-9.9 0L10.063 3.5a2 2 0 0 1 3.874 0z"/>
      <path d="M9.194 6.57a5 2.5 0 0 0 5.61 0"/>
    </svg>
  `,
  squareParking: (color: string, size = 32) => `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${
      size / 16
    }" stroke-linecap="round" stroke-linejoin="round">
      <rect width="18" height="18" x="3" y="3" rx="2"/>
      <path d="M9 17V7h4a3 3 0 0 1 0 6H9"/>
    </svg>
  `,
  bike: (color: string, size = 32) => `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${
      size / 16
    }" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="18.5" cy="17.5" r="3.5"/>
      <circle cx="5.5" cy="17.5" r="3.5"/>
      <circle cx="15" cy="5" r="1"/>
      <path d="M12 17.5V14l-3-3 4-3 2 3h2"/>
    </svg>
  `,
  // Civic
  school: (color: string, size = 32) => `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${
      size / 16
    }" stroke-linecap="round" stroke-linejoin="round">
      <path d="M14 21v-3a2 2 0 0 0-4 0v3"/>
      <path d="M18 5v16"/>
      <path d="m4 6 7.106-3.79a2 2 0 0 1 1.788 0L20 6"/>
      <path d="m6 11-3.52 2.147a1 1 0 0 0-.48.854V19a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a1 1 0 0 0-.48-.853L18 11"/>
      <path d="M6 5v16"/>
      <circle cx="12" cy="9" r="2"/>
    </svg>
  `,
  hospital: (color: string, size = 32) => `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${
      size / 16
    }" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 7v4"/>
      <path d="M14 21v-3a2 2 0 0 0-4 0v3"/>
      <path d="M14 9h-4"/>
      <path d="M18 11h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h2"/>
      <path d="M18 21V5a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16"/>
    </svg>
  `,
  pill: (color: string, size = 32) => `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${
      size / 16
    }" stroke-linecap="round" stroke-linejoin="round">
      <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/>
      <path d="m8.5 8.5 7 7"/>
    </svg>
  `,
  volleyball: (color: string, size = 32) => `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${
      size / 16
    }" stroke-linecap="round" stroke-linejoin="round">
      <path d="M11.1 7.1a16.55 16.55 0 0 1 10.9 4"/>
      <path d="M12 12a12.6 12.6 0 0 1-8.7 5"/>
      <path d="M16.8 13.6a16.55 16.55 0 0 1-9 7.5"/>
      <path d="M20.7 17a12.8 12.8 0 0 0-8.7-5 13.3 13.3 0 0 1 0-10"/>
      <path d="M6.3 3.8a16.55 16.55 0 0 0 1.9 11.5"/>
      <circle cx="12" cy="12" r="10"/>
    </svg>
  `,
  bookOpen: (color: string, size = 32) => `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${
      size / 16
    }" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 7v14"/>
      <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>
    </svg>
  `,
  // Environment
  treePalm: (color: string, size = 32) => `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${
      size / 16
    }" stroke-linecap="round" stroke-linejoin="round">
      <path d="M13 8c0-2.76-2.46-5-5.5-5S2 5.24 2 8h2l1-1 1 1h4"/>
      <path d="M13 7.14A5.82 5.82 0 0 1 16.5 6c3.04 0 5.5 2.24 5.5 5h-3l-1-1-1 1h-3"/>
      <path d="M5.89 9.71c-2.15 2.15-2.3 5.47-.35 7.43l4.24-4.25.7-.7.71-.71 2.12-2.12c-1.95-1.96-5.27-1.8-7.42.35"/>
      <path d="M11 15.5c.5 2.5-.17 4.5-1 6.5h4c2-5.5-.5-12-1-14"/>
    </svg>
  `,
  treeDeciduous: (color: string, size = 32) => `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${
      size / 16
    }" stroke-linecap="round" stroke-linejoin="round">
      <path d="M8 19a4 4 0 0 1-2.24-7.32A3.5 3.5 0 0 1 9 6.03V6a3 3 0 1 1 6 0v.04a3.5 3.5 0 0 1 3.24 5.65A4 4 0 0 1 16 19Z"/>
      <path d="M12 19v3"/>
    </svg>
  `,
  droplet: (color: string, size = 32) => `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${
      size / 16
    }" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>
    </svg>
  `,
  // Leisure
  shoppingCart: (color: string, size = 32) => `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${
      size / 16
    }" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="8" cy="21" r="1"/>
      <circle cx="19" cy="21" r="1"/>
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
    </svg>
  `,
  utensils: (color: string, size = 32) => `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${
      size / 16
    }" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>
      <path d="M7 2v20"/>
      <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>
    </svg>
  `,
  coffee: (color: string, size = 32) => `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${
      size / 16
    }" stroke-linecap="round" stroke-linejoin="round">
      <path d="M10 2v2"/>
      <path d="M14 2v2"/>
      <path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"/>
      <path d="M6 2v2"/>
    </svg>
  `,
  dumbbell: (color: string, size = 32) => `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${
      size / 16
    }" stroke-linecap="round" stroke-linejoin="round">
      <path d="M17.596 12.768a2 2 0 1 0 2.829-2.829l-1.768-1.767a2 2 0 0 0 2.828-2.829l-2.828-2.828a2 2 0 0 0-2.829 2.828l-1.767-1.768a2 2 0 1 0-2.829 2.829z"/>
      <path d="m2.5 21.5 1.4-1.4"/>
      <path d="m20.1 3.9 1.4-1.4"/>
      <path d="M5.343 21.485a2 2 0 1 0 2.829-2.828l1.767 1.768a2 2 0 1 0 2.829-2.829l-6.364-6.364a2 2 0 1 0-2.829 2.829l1.768 1.767a2 2 0 0 0-2.828 2.829z"/>
      <path d="m9.6 14.4 4.8-4.8"/>
    </svg>
  `,
  wavesLadder: (color: string, size = 32) => `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${
      size / 16
    }" stroke-linecap="round" stroke-linejoin="round">
      <path d="M19 5a2 2 0 0 0-2 2v11"/>
      <path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
      <path d="M7 13h10"/>
      <path d="M7 9h10"/>
      <path d="M9 5a2 2 0 0 0-2 2v11"/>
    </svg>
  `,
  film: (color: string, size = 32) => `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${
      size / 16
    }" stroke-linecap="round" stroke-linejoin="round">
      <rect width="18" height="18" x="3" y="3" rx="2"/>
      <path d="M7 3v18"/>
      <path d="M3 7.5h4"/>
      <path d="M3 12h18"/>
      <path d="M3 16.5h4"/>
      <path d="M17 3v18"/>
      <path d="M17 7.5h4"/>
      <path d="M17 16.5h4"/>
    </svg>
  `,
  theater: (color: string, size = 32) => `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${
      size / 16
    }" stroke-linecap="round" stroke-linejoin="round">
      <path d="M2 10s3-3 3-8"/>
      <path d="M22 10s-3-3-3-8"/>
      <path d="M10 2c0 4.4-3.6 8-8 8"/>
      <path d="M14 2c0 4.4 3.6 8 8 8"/>
      <path d="M2 10s2 2 2 5"/>
      <path d="M22 10s-2 2-2 5"/>
      <path d="M8 15h8"/>
      <path d="M2 22v-1a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1"/>
      <path d="M14 22v-1a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1"/>
    </svg>
  `,
  landmark: (color: string, size = 32) => `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${
      size / 16
    }" stroke-linecap="round" stroke-linejoin="round">
      <path d="M10 18v-7"/>
      <path d="M11.12 2.198a2 2 0 0 1 1.76.006l7.866 3.847c.476.233.31.949-.22.949H3.474c-.53 0-.695-.716-.22-.949z"/>
      <path d="M14 18v-7"/>
      <path d="M18 18v-7"/>
      <path d="M3 22h18"/>
      <path d="M6 18v-7"/>
    </svg>
  `,
  circle: (color: string, size: number) => `
    <svg xmlns="http://www.w3.org/2000/svg" 
         width="${size}" 
         height="${size}" 
         viewBox="0 0 24 24" 
         fill="${color}">
      <circle cx="12" cy="12" r="10" />
    </svg>
  `,
  home: (color: string, size = 32) => `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${
      size / 16
    }" stroke-linecap="round" stroke-linejoin="round">
      <path d="M10 18v-7"/>
      <path d="M11.12 2.198a2 2 0 0 1 1.76.006l7.866 3.847c.476.233.31.949-.22.949H3.474c-.53 0-.695-.716-.22-.949z"/>
      <path d="M14 18v-7"/>
      <path d="M18 18v-7"/>
      <path d="M3 22h18"/>
      <path d="M6 18v-7"/>
    </svg>
  `,
  mapPin: (color: string, size: number) => `
    <svg xmlns="http://www.w3.org/2000/svg" 
         width="${size}" 
         height="${size}" 
         viewBox="0 0 24 24" 
         fill="${color}">
      <circle cx="12" cy="12" r="10" />
    </svg>
  `,
};

// Generalized default configuration
const DEFAULT_ICON_CONFIG = {
  size: [32, 32] as [number, number],
  anchor: [12, 12] as [number, number],
  popupAnchor: [0, -30] as [number, number],
};

export { ICON_PRESETS, DEFAULT_ICON_CONFIG };
