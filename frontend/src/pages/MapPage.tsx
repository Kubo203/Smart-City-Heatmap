/* eslint-disable @typescript-eslint/no-explicit-any */
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FilterSection } from "../components/custom/filter/FilterSection";
import { Map } from "../components/custom/map/Map";
import { ToggleSwitch } from "../components/custom/ToggleSwitch";
import { getFilterSections } from "../const/filters";
import { fetchMapData, getUserPreferences, saveUserFilters } from "../lib/api";
import {
  buildMapQuery,
  calculateRadius,
  extractHeatmapPoints,
  extractMarkers,
} from "../lib/helper";
import type { MarkerInfo } from "../utils/types";
import useLocation from "@/utils/useLocation";

export default function MapPage() {
  const { t } = useTranslation();
  const filterSections = getFilterSections(t);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [showPins, setShowPins] = useState<boolean>(false);
  const [showFilter, setShowFilter] = useState<boolean>(true);
  const [satelliteView, setSatelliteView] = useState<boolean>(false);
  const [heatPoints, setHeatPoints] = useState<[number, number, number][]>([]);
  const [markerPoints, setMarkerPoints] = useState<MarkerInfo[]>([]);
  const { name, lat, lon, loading } = useLocation();
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    48.716385, 21.261074,
  ]);
  const [selectedLocation, setSelectedLocation] = useState<{
    name: string;
    lat: string;
    lon: string;
    boundingbox?: [string, string, string, string];
  }>({
    name: "Košice",
    lat: "48.716385",
    lon: "21.261074",
    boundingbox: undefined,
  });

  // Update state when location loads
  useEffect(() => {
    if (lat && lon && !loading) {
      setMapCenter([lat, lon]);
      setSelectedLocation({
        name: name || "Košice",
        lat: lat.toString(),
        lon: lon.toString(),
      });
    }
    getUserPreferences().then((preferences) => {
      if (preferences) {
        setSelectedFilters(preferences.filters);
        setSelectedLocation(preferences.location);

        setMapCenter([
          parseFloat(preferences.location.lat),
          parseFloat(preferences.location.lon),
        ]);
      }
    });
  }, [name, lat, lon, loading]);

  const applyFilter = async () => {
    if (selectedFilters.length > 0) {
      let allElements: any[] = [];
      const maxConcurrent = 3;
      let index = 0;

      // Calculate dynamic radius
      const radius = calculateRadius(selectedLocation.boundingbox);
      const centerLat = parseFloat(selectedLocation.lat);
      const centerLon = parseFloat(selectedLocation.lon);

      async function runBatch() {
        const batch = selectedFilters
          .slice(index, index + maxConcurrent)
          .map(async (filter) => {
            const query = buildMapQuery([filter], {
              bounds: {
                south: centerLat - radius,
                west: centerLon - radius,
                north: centerLat + radius,
                east: centerLon + radius,
              },
            });
            try {
              const data = await fetchMapData(query);
              return data.elements;
            } catch (err) {
              console.error(`Error fetching filter: ${filter}`, err);
              return [];
            }
          });
        const results = await Promise.all(batch);
        results.forEach((elements) => {
          allElements = allElements.concat(elements);
        });
        index += maxConcurrent;
      }

      while (index < selectedFilters.length) {
        await runBatch();
        await new Promise((res) => setTimeout(res, 200));
      }

      setHeatPoints(extractHeatmapPoints(allElements));
      setMarkerPoints(extractMarkers(allElements));
    } else {
      setHeatPoints([]);
      setMarkerPoints([]);
    }
    // Save filters to preferences (location is saved separately when selected)
    saveUserFilters(selectedFilters).catch((error) => {
      console.error("Failed to save filter preferences:", error);
    });
  };

  return (
    <div className="relative w-full h-full flex flex-row">
      <FilterSection
        selectedFilters={selectedFilters}
        onFiltersChange={setSelectedFilters}
        filterSections={filterSections}
        showPins={showPins}
        onShowPinsChange={setShowPins}
        applyFilter={applyFilter}
        showFilter={showFilter}
        setShowFilter={setShowFilter}
        onLocationChange={(location) => {
          setSelectedLocation({
            name: location.name,
            lat: location.lat,
            lon: location.lon,
            boundingbox: location.boundingbox,
          });
          setMapCenter([parseFloat(location.lat), parseFloat(location.lon)]);
        }}
      />
      <Map
        center={mapCenter}
        boundingbox={selectedLocation.boundingbox}
        tileLayer={{
          url: satelliteView
            ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          attribution: satelliteView
            ? '&copy; <a href="https://www.esri.com/">Esri</a>'
            : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }}
        markerPoints={markerPoints}
        heatmapPoints={heatPoints}
        showPins={showPins}
        setShowFilter={setShowFilter}
        layersButton={{
          show: true,
          position: "bottom-right",
          content: (
            <div className="bg-white p-3 rounded-lg shadow-lg border">
              <ToggleSwitch
                label={t("general.sateliteview")}
                checked={satelliteView}
                onCheckedChange={setSatelliteView}
                size="sm"
                labelPosition="left"
                className="whitespace-nowrap"
              />
            </div>
          ),
        }}
      />
    </div>
  );
}
