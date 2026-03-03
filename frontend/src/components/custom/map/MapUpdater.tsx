import { useEffect } from "react";
import { useMap } from "react-leaflet";

export function MapUpdater({
  center,
  boundingbox,
}: {
  center: [number, number];
  boundingbox?: [string, string, string, string];
}) {
  const map = useMap();

  useEffect(() => {
    if (boundingbox) {
      const [south, north, west, east] = boundingbox.map(parseFloat);

      // Fly to bounds with animation
      map.flyToBounds(
        [
          [south, west],
          [north, east],
        ],
        {
          padding: [50, 50],
          duration: 1.5,
          easeLinearity: 0.25,
          maxZoom: 16,
        }
      );
    } else {
      // Just fly to center if no boundingbox
      map.flyTo(center, map.getZoom(), {
        duration: 1.5,
        easeLinearity: 0.25,
      });
    }
  }, [center, boundingbox, map]);

  return null;
}
