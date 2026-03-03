import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";
import { useEffect } from "react";

interface HeatmapLayerProps {
  points: [number, number, number][];
}

export function HeatmapLayer({ points }: HeatmapLayerProps) {
  const map = useMap();
  const maxRadius = 105;

  useEffect(() => {
    if (!points || points.length === 0) return;

    // Calculate radius based on zoom level to maintain geographic consistency
    // Each zoom level doubles the scale, so radius doubles to maintain same geographic area
    const calculateRadiusFromZoom = () => {
      const zoom = map.getZoom();
      const referenceZoom = 10; // Reference zoom level
      const baseRadius = 2; // Base radius at reference zoom level
      // console.log(zoom, referenceZoom, baseRadius);
      // Scale radius exponentially: radius = baseRadius * 2^(zoom - referenceZoom)
      // This ensures the geographic size remains constant across zoom levels
      const radius = baseRadius * Math.pow(2, zoom - referenceZoom);
      // console.log(radius);
      // Clamp between reasonable min/max values
      return Math.max(10, Math.min(maxRadius, radius));
    };

    // Calculate opacity inversely proportional to radius
    // Smaller radius = higher opacity (0.5), larger radius = lower opacity (0.35)
    const calculateOpacityFromRadius = (radius: number) => {
      const minRadius = 10;
      const minOpacity = 0.5; // Opacity when radius is smallest
      const maxOpacity = 0.35; // Opacity when radius is largest
      
      // Linear interpolation: opacity decreases as radius increases
      const opacityRange = minOpacity - maxOpacity;
      const radiusRange = maxRadius - minRadius;
      const opacity = minOpacity - (opacityRange * (radius - minRadius) / radiusRange);
      
      return Math.max(maxOpacity, Math.min(minOpacity, opacity));
    };

    // Calculate blur proportional to radius
    // Smaller radius = smaller blur (10), larger radius = larger blur (20)
    const calculateBlurFromRadius = (radius: number) => {
      const minRadius = 10;
      const minBlur = 10; // Blur when radius is smallest
      const maxBlur = 20; // Blur when radius is largest
      
      // Linear interpolation: blur increases as radius increases
      const blurRange = maxBlur - minBlur;
      const radiusRange = maxRadius - minRadius;
      const blur = minBlur + (blurRange * (radius - minRadius) / radiusRange);
      
      return Math.max(minBlur, Math.min(maxBlur, blur));
    };

    const radius = calculateRadiusFromZoom();
    const minOpacity = calculateOpacityFromRadius(radius);
    const blur = calculateBlurFromRadius(radius);

    const heatLayer = L.heatLayer(points, {
      radius: radius,
      blur: blur,
      maxZoom: 20,
      max: 1.0,
      minOpacity: minOpacity,
    }).addTo(map);

    // Update on zoom change
    const updateRadius = () => {
      const newRadius = calculateRadiusFromZoom();
      const newOpacity = calculateOpacityFromRadius(newRadius);
      const newBlur = calculateBlurFromRadius(newRadius);
      heatLayer.setOptions({ radius: newRadius, minOpacity: newOpacity, blur: newBlur });
    };

    map.on("zoomend", updateRadius);

    return () => {
      map.off("zoomend", updateRadius);
      map.off("resize", updateRadius);
      map.removeLayer(heatLayer);
    };
  }, [points, map]);

  return null;
}
