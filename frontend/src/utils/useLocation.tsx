import { useEffect, useState } from "react";
import type { LocationData } from "./types";

export default function useLocation() {
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getLocation() {
      try {
        const res = await fetch("http://ip-api.com/json");
        if (res.status === 200) {
          const data = await res.json();
          setLocationData(data);
        }
      } catch (error) {
        console.error("Location fetch failed:", error);
      } finally {
        setLoading(false);
      }
    }
    getLocation();
  }, []);

  if (loading) {
    return { name: undefined, lat: undefined, lon: undefined, loading: true };
  }

  return {
    name: locationData?.city,
    lat: locationData?.lat,
    lon: locationData?.lon,
    loading: false,
  };
}
