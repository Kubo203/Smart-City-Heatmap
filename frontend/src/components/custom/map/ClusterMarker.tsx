/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useMemo, useState, useEffect, useCallback } from "react";
import { CustomMarker } from "./CustomMarker";
import { useMap } from "react-leaflet";
import { Circle } from "react-leaflet";
import type { MarkerInfo } from "@/utils/types";

interface ClusterMarkerProps {
  markers: MarkerInfo[];
  clusterRadius?: number; // in degrees for expanded markers
  clusterPixelRadius?: number; // in pixels for clustering
  showClusterRadius?: boolean; // NEW: show circle around cluster
  clusterCircleColor?: string; // NEW: color for the circle
  clusterCircleOpacity?: number; // NEW: opacity for the circle
}

function ClusterMarker({
  markers,
  clusterRadius = 0.0003,
  clusterPixelRadius = 50,
  showClusterRadius = true, // Default: show circles
  clusterCircleColor = "#3b82f6", // Blue color
  clusterCircleOpacity = 0.2, // 20% opacity
}: ClusterMarkerProps) {
  const map = useMap();
  const [expandedClusterId, setExpandedClusterId] = useState<number | null>(
    null,
  );
  const [currentZoom, setCurrentZoom] = useState(map.getZoom());
  const [hoveredCluster, setHoveredCluster] = useState<number | null>(null);

  // Update zoom when map changes
  useEffect(() => {
    const updateZoom = () => setCurrentZoom(map.getZoom());

    map.on("zoomend", updateZoom);
    map.on("moveend", updateZoom);

    return () => {
      map.off("zoomend", updateZoom);
      map.off("moveend", updateZoom);
    };
  }, [map]);

  // Calculate cluster radius in degrees for the circle
  const getClusterCircleRadius = useCallback(
    (cluster: MarkerInfo[]): number => {
      if (cluster.length === 1) return 0;

      // Calculate the bounding box of the cluster
      const lats = cluster.map((m) => m.position[0]);
      const lngs = cluster.map((m) => m.position[1]);

      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);

      // Calculate radius as half of the diagonal
      const latDiff = maxLat - minLat;
      const lngDiff = maxLng - minLng;

      // Add some padding (20%)
      return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 0.6;
    },
    [],
  );

  // Get zoom-dependent clustering
  const clusters = useMemo(() => {
    if (markers.length === 0) return [];

    const zoomFactor = Math.max(1, (18 - currentZoom) * 0.5);
    const adjustedPixelRadius = clusterPixelRadius * zoomFactor;

    const center = map.getCenter();
    const pointCenter = map.latLngToContainerPoint(center);
    const pointRight = map.latLngToContainerPoint([
      center.lat,
      center.lng + 0.001,
    ]);

    const pixelsPerDegree = Math.abs(pointRight.x - pointCenter.x) * 1000;
    const maxDistanceDegrees = adjustedPixelRadius / pixelsPerDegree;

    const clusters: MarkerInfo[][] = [];
    const usedMarkers = new Set<string | number>();

    markers.forEach((marker, index) => {
      if (usedMarkers.has(marker.id || index)) return;

      const cluster = [marker];
      usedMarkers.add(marker.id || index);

      markers.forEach((otherMarker, otherIndex) => {
        if (usedMarkers.has(otherMarker.id || otherIndex)) return;

        const distance = Math.sqrt(
          Math.pow(marker.position[0] - otherMarker.position[0], 2) +
            Math.pow(marker.position[1] - otherMarker.position[1], 2),
        );

        if (distance < maxDistanceDegrees) {
          cluster.push(otherMarker);
          usedMarkers.add(otherMarker.id || otherIndex);
        }
      });

      if (cluster.length > 1) {
        clusters.push(cluster);
      } else {
        usedMarkers.delete(marker.id || index);
      }
    });

    markers.forEach((marker, index) => {
      if (!usedMarkers.has(marker.id || index)) {
        clusters.push([marker]);
      }
    });

    return clusters;
  }, [markers, map, clusterPixelRadius, currentZoom]);

  const handleClusterClick = useCallback(
    (cluster: MarkerInfo[], clusterIndex: number) => {
      const center = calculateClusterCenter(cluster);
      const maxZoom = map.getMaxZoom();

      if (cluster.length === 1) {
        map.flyTo(center, maxZoom, { duration: 0.5 });
        setExpandedClusterId(null);
      } else if (currentZoom < maxZoom) {
        const targetZoom = Math.min(currentZoom + 2, maxZoom);
        map.flyTo(center, targetZoom, { duration: 0.5 });
        setExpandedClusterId(null);
      } else {
        setExpandedClusterId(
          expandedClusterId === clusterIndex ? null : clusterIndex,
        );
      }
    },
    [map, currentZoom, expandedClusterId],
  );

  const calculateClusterCenter = (markers: MarkerInfo[]): [number, number] => {
    const avgLat =
      markers.reduce((sum, m) => sum + m.position[0], 0) / markers.length;
    const avgLng =
      markers.reduce((sum, m) => sum + m.position[1], 0) / markers.length;
    return [avgLat, avgLng];
  };

  const calculateClusterColor = (markers: MarkerInfo[]): string => {
    const colorsHex = markers
      .map((marker) => (marker as any).color)
      .filter((color): color is string => !!color);

    if (colorsHex.length === 0) return "#aabb80";

    let sumR = 0,
      sumG = 0,
      sumB = 0;
    colorsHex.forEach((hex) => {
      const cleanHex = hex.replace("#", "");
      sumR += parseInt(cleanHex.substring(0, 2), 16);
      sumG += parseInt(cleanHex.substring(2, 4), 16);
      sumB += parseInt(cleanHex.substring(4, 6), 16);
    });

    const toHex = (value: number): string =>
      Math.round(value / colorsHex.length)
        .toString(16)
        .padStart(2, "0");

    return `#${toHex(sumR)}${toHex(sumG)}${toHex(sumB)}`;
  };

  const spiralLayout = (
    index: number,
    total: number,
    radius: number,
  ): [number, number] => {
    // Golden angle for even distribution
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));

    // Adjust distance based on total markers - more markers need more space
    const densityFactor = Math.max(1, total / 10);
    const distance = radius * Math.sqrt(index / total) * densityFactor;
    const angle = goldenAngle * index;

    return [Math.cos(angle) * distance, Math.sin(angle) * distance];
  };

  return (
    <>
      {/* Render each cluster with optional circle */}
      {clusters.map((cluster, clusterIndex) => {
        const isExpanded = expandedClusterId === clusterIndex;
        const center = calculateClusterCenter(cluster);
        const clusterColor = calculateClusterColor(cluster);
        const isSingleMarker = cluster.length === 1;
        const isAtMaxZoom = currentZoom >= map.getMaxZoom();
        const circleRadius = getClusterCircleRadius(cluster);
        const isHovered = hoveredCluster === clusterIndex;

        return (
          <div key={`cluster-${clusterIndex}`}>
            {/* Cluster radius circle (only for multi-marker clusters) */}
            {showClusterRadius && !isSingleMarker && circleRadius > 0 && (
              <Circle
                center={center}
                radius={circleRadius * 111320} // Convert degrees to meters (approx)
                pathOptions={{
                  fillColor: clusterCircleColor,
                  fillOpacity: isHovered
                    ? clusterCircleOpacity * 1.5
                    : clusterCircleOpacity,
                  color: clusterColor,
                  weight: isHovered ? 2 : 1,
                  opacity: isHovered ? 0.8 : 0.5,
                }}
                eventHandlers={{
                  mouseover: () => setHoveredCluster(clusterIndex),
                  mouseout: () => setHoveredCluster(null),
                }}
              />
            )}

            {/* Cluster marker (only for clusters with 2+ markers) */}
            {!isSingleMarker && (
              <CustomMarker
                position={center}
                size={36 + Math.min(cluster.length * 3, 24)} // Increased from 30 + 2/cluster
                color={clusterColor}
                onClick={() => handleClusterClick(cluster, clusterIndex)}
                onMouseEnter={() => setHoveredCluster(clusterIndex)}
                onMouseLeave={() => setHoveredCluster(null)}
                label={isExpanded ? `${cluster.length} markers` : ""}
                showCount={cluster.length}
              />
            )}

            {/* Single markers or expanded cluster markers */}
            {(isSingleMarker || (isExpanded && isAtMaxZoom)) &&
              cluster.map((marker, markerIndex) => {
                let markerPosition: [number, number];

                if (isSingleMarker) {
                  markerPosition = marker.position;
                } else {
                  // Dynamic radius based on marker count
                  const dynamicRadius =
                    clusterRadius * Math.max(3, Math.sqrt(cluster.length));
                  const [dx, dy] = spiralLayout(
                    markerIndex,
                    cluster.length,
                    dynamicRadius,
                  );
                  markerPosition = [center[0] + dx, center[1] + dy];
                }

                return (
                  <CustomMarker
                    key={marker.id || markerIndex}
                    position={markerPosition}
                    color={(marker as any).color || clusterColor}
                    iconName={marker.icon}
                    onClick={() => {
                      if (isSingleMarker) {
                        handleClusterClick(cluster, clusterIndex);
                      } else {
                        console.log("Expanded marker clicked:", marker.id);
                      }
                    }}
                    popupContent={marker.popupContent}
                  >
                    {marker.popupContent}
                  </CustomMarker>
                );
              })}
          </div>
        );
      })}
    </>
  );
}

export { ClusterMarker };
