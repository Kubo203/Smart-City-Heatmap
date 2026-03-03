import type { ICON_PRESETS } from "@/const/filters";

export type MultiSelectOption = {
  label: string;
  value: string;
  icon?: React.ReactNode; // Make it optional if some options might not have icons
};

export type BoundingBox = {
  south: number;
  west: number;
  north: number;
  east: number;
};

export type MapElement = {
  type: string;
  lat?: number;
  lon?: number;
  center?: {
    lat: number;
    lon: number;
  };
  tags?: Record<string, string>;
};

// types.ts - Update MarkerInfo interface
export interface MarkerInfo {
  id?: string | number;
  position: [number, number];
  name: string;
  address?: string;
  website?: string;
  icon?: keyof typeof ICON_PRESETS;
  popupContent?: React.ReactNode;
  color?: string; // ADD THIS
}

export interface EnhancedMarkerInfo extends MarkerInfo {
  osmType: "node" | "way" | "relation";
  osmId: number;
  tags: Record<string, string>;
  shouldShowPopup: boolean;
  popupData?: {
    address?: string;
    website?: string;
    phone?: string;
    email?: string;
    openingHours?: string;
    // Add other relevant fields
  };
}

export interface UserPreferences {
  filters: string[];
  location: {
    name: string;
    lat: string;
    lon: string;
    boundingbox?: [string, string, string, string];
  };
  updatedAt?: string;
}

export type LocationData = {
  city: string;
  lat: number;
  lon: number;
};
