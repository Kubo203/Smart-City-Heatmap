import { MapContainer, TileLayer, type MapContainerProps } from "react-leaflet";
import { useRef, type ReactNode } from "react";
import { HeatmapLayer } from "./HeatmapLayer";
import { MapUpdater } from "./MapUpdater";
import { Funnel } from "lucide-react";
// import { CustomPin } from "./CustomPin";
import type { Map as LeafletMap } from "leaflet";
import type { MarkerInfo } from "@/utils/types";
import type { ICON_PRESETS } from "@/const/filters";
import "leaflet/dist/leaflet.css";
import { ClusterMarker } from "./ClusterMarker";
import { CustomPin } from "./CustomPin";

interface MapProps extends Partial<MapContainerProps> {
  center?: [number, number];
  zoom?: number;
  boundingbox?: [string, string, string, string];
  className?: string;
  tileLayer?: {
    url: string;
    attribution?: string;
  };
  children?: ReactNode;
  markerPoints?: MarkerInfo[];
  heatmapPoints?: [number, number, number][];
  showPins: boolean;
  setShowFilter: (show: boolean) => void;
  layersButton?: {
    show?: boolean;
    position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
    content?: ReactNode;
    className?: string;
  };
  containerClassName?: string;
}

export function Map({
  center = [48.716385, 21.261074],
  zoom = 8,
  boundingbox,
  className = "h-full w-full z-0",
  tileLayer = {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  children,
  markerPoints = [],
  heatmapPoints = [],
  showPins = false,
  setShowFilter,
  layersButton = {
    show: true,
    position: "bottom-right",
    content: "Layers",
    className: "text-amber-400",
  },
  containerClassName = "flex-1 flex w-full h-full",
  ...mapContainerProps
}: MapProps) {
  const mapRef = useRef<LeafletMap | null>(null);

  const getLayersButtonPosition = (
    position?: "top-left" | "top-right" | "bottom-left" | "bottom-right",
  ) => {
    const positions = {
      "top-left": "top-0 left-0 m-4",
      "top-right": "top-0 right-0 m-4",
      "bottom-left": "bottom-0 left-0 m-4",
      "bottom-right": "bottom-0 right-0 p-4",
    };
    return positions[position || "bottom-right"];
  };

  const getColorFromIcon = (icon: keyof typeof ICON_PRESETS): string => {
    const colorMap: Record<string, string> = {
      // Mobility - Vibrant Blues & Purples
      bus: "#1d4ed8", // Royal Blue
      trafficCone: "#a855f7", // Vibrant Purple
      squareParking: "#3b82f6", // Bright Blue
      bike: "#06b6d4", // Cyan

      // Civic - Greens & Teals
      school: "#10b981", // Emerald Green
      hospital: "#ef4444", // Red (for health/emergency)
      pill: "#8b5cf6", // Violet Purple
      volleyball: "#22c55e", // Green
      bookOpen: "#0ea5e9", // Sky Blue

      // Environment - Nature Greens & Blues
      treePalm: "#84cc16", // Lime Green
      treeDeciduous: "#16a34a", // Forest Green
      droplet: "#0ea5e9", // Ocean Blue

      // Leisure - Warm Colors (Oranges, Reds, Pinks)
      shoppingCart: "#f97316", // Orange
      utensils: "#dc2626", // Red
      coffee: "#c2410c", // Dark Orange
      dumbbell: "#e11d48", // Rose Red
      wavesLadder: "#0891b2", // Cyan Blue
      film: "#7c3aed", // Indigo Purple
      theater: "#be185d", // Pink
      landmark: "#f59e0b", // Amber

      // Add more distinct colors for any additional icons
      // You can add more here if you expand your icon set
    };

    // Fallback color - using a different approach for better variety
    // If icon not found, generate a color based on the icon name
    if (!colorMap[icon]) {
      // Create a simple hash from the icon name for consistent color
      const hash = icon.split("").reduce((acc, char) => {
        return char.charCodeAt(0) + ((acc << 5) - acc);
      }, 0);

      // Generate bright, saturated colors
      const hue = Math.abs(hash % 360);
      return `hsl(${hue}, 85%, 55%)`;
    }

    return colorMap[icon];
  };

  return (
    <div className={containerClassName}>
      <MapContainer
        ref={mapRef}
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className={className}
        {...mapContainerProps}
      >
        <MapUpdater center={center} boundingbox={boundingbox} />
        <TileLayer attribution={tileLayer.attribution} url={tileLayer.url} />
        {heatmapPoints.length > 0 && <HeatmapLayer points={heatmapPoints} />}
        {showPins && markerPoints.length > 0 && (
          <ClusterMarker
            markers={markerPoints.map((point, index) => ({
              id: point.id || index,
              position: point.position,
              name: point.name,
              color: getColorFromIcon(point.icon || "bus"), // Add color here
              icon: point.icon,
              popupContent: point.popupContent, // Use the popupContent from extractMarkers
            }))}
            clusterPixelRadius={100}
            clusterRadius={0.00003}
            showClusterRadius={false}
          />
        )}
        <CustomPin
          position={center}
          size={20}
          color="red"
          onClick={() => mapRef.current?.setView(center, 15)}
        />
        {children}
      </MapContainer>

      {/* Layers Button */}
      {layersButton.show && (
        <div
          className={`absolute z-50 ${getLayersButtonPosition(
            layersButton.position,
          )} ${layersButton.className}`}
        >
          {layersButton.content}
        </div>
      )}
      <button
        className={`md:hidden bg-white p-1.5 rounded-lg shadow-lg border absolute z-50 ${getLayersButtonPosition(
          "bottom-left",
        )}`}
        onClick={() => setShowFilter(true)}
      >
        <Funnel size={26} />
      </button>
    </div>
  );
}
