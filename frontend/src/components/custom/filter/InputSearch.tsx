// In InputSearch.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Input } from "@/components/ui/input";
import { getSearchResultIconComponent } from "@/const/filters";
import { saveUserLocation } from "@/lib/api";
import {
  formatAddress,
  formatSearchResultAddress,
  translateOSMType,
} from "@/lib/helper";
import { Search, MapPin, Globe } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";

export interface SearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  osm_type: string;
  boundingbox?: [string, string, string, string];
  address?: {
    road?: string;
    house_number?: string;
    city?: string;
    village?: string;
    town?: string;
    country?: string;
    suburb?: string;
    postcode?: string;
    state?: string;
    country_code?: string;
  };
  importance?: number;
  class?: string;
  name?: string;
}

interface InputSearchProps {
  placeholder?: string;
  label?: string;
  onSelectLocation?: (location: SearchResult) => void;
  minQueryLength?: number;
  maxResults?: number;
}

// Group similar results to avoid duplicates
const groupSimilarResults = (results: SearchResult[]): SearchResult[] => {
  const groups: Record<string, SearchResult[]> = {};

  results.forEach((result) => {
    const address = result.address || {};
    const key = [
      address.road || result.name || "",
      address.city || address.town || address.village || "",
      address.country_code || "",
    ].join("|");

    if (!groups[key]) groups[key] = [];
    groups[key].push(result);
  });

  // Return the best result from each group (highest importance)
  return Object.values(groups).map(
    (group) =>
      group.sort((a, b) => (b.importance || 0) - (a.importance || 0))[0],
  );
};

export default function InputSearch({
  placeholder,
  label,
  onSelectLocation,
  minQueryLength = 2,
  maxResults = 8,
}: InputSearchProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const defaultPlaceholder = placeholder ?? t("general.search");
  const defaultLabel = label ?? t("general.findbyaddress");

  // Simple debounce function
  const debounce = <T extends unknown[]>(
    func: (...args: T) => void,
    delay: number,
  ) => {
    return (...args: T) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => func(...args), delay);
    };
  };

  // Search function
  // Update the performSearch function to remove the undefined variables
  const performSearch = useCallback(
    async (query: string) => {
      if (query.length < minQueryLength) {
        setResults([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const searchParams = new URLSearchParams({
          q: query,
          format: "json",
          addressdetails: "1",
          limit: "15",
          "accept-language": "sk,en",
        });

        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?${searchParams}`,
          {
            headers: {
              "User-Agent": "CityMapApp/1.0",
              Accept: "application/json",
            },
          },
        );

        if (!response.ok) throw new Error("Search failed");

        const data: SearchResult[] = await response.json();

        // Filter and group results
        const filteredResults = data
          .filter((result) => result.lat && result.lon && result.display_name)
          .map((result) => ({
            ...result,
            lat: parseFloat(result.lat).toFixed(6),
            lon: parseFloat(result.lon).toFixed(6),
          }));

        // Simple sort by importance
        const sortedResults = filteredResults.sort(
          (a, b) => (b.importance || 0) - (a.importance || 0),
        );

        const groupedResults = groupSimilarResults(sortedResults);
        const limitedResults = groupedResults.slice(0, maxResults);

        setResults(limitedResults);
      } catch (error) {
        console.error("Search error:", error);
        setError("Failed to search location");
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [minQueryLength, maxResults],
  );

  // Debounced search
  const debouncedSearch = useCallback(
    debounce<string[]>((query: string) => performSearch(query), 300),
    [performSearch],
  );

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Trigger search
  useEffect(() => {
    if (searchQuery.trim().length >= minQueryLength) {
      debouncedSearch(searchQuery.trim());
    } else {
      setResults([]);
      setShowResults(false);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [searchQuery, minQueryLength, debouncedSearch]);

  const handleSelectResult = (result: SearchResult) => {
    const formattedAddress = formatSearchResultAddress(result, t);
    setSearchQuery(formattedAddress);
    setShowResults(false);
    onSelectLocation?.(result);

    // Save location to preferences
    saveUserLocation({
      name: formatAddress(result),
      lat: result.lat,
      lon: result.lon,
      boundingbox: result.boundingbox,
    }).catch((error) => {
      console.error("Failed to save location preferences:", error);
    });
  };

  return (
    <div className="flex flex-col gap-1.5 w-full relative" ref={searchRef}>
      <div className="relative w-full">
        <Search
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
          size={18}
        />
        <Input
          placeholder={defaultPlaceholder}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (e.target.value.trim().length >= minQueryLength) {
              setShowResults(true);
            }
          }}
          onFocus={() => {
            if (
              searchQuery.trim().length >= minQueryLength &&
              results.length > 0
            ) {
              setShowResults(true);
            }
          }}
          className="pl-9 bg-[#fdfdfd] border-[#cbd5e1] text-sm focus-visible:ring-1 focus-visible:ring-slate-300"
        />
        {isLoading && (
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
            <div className="animate-spin h-4 w-4 border-2 border-slate-300 border-t-slate-600 rounded-full" />
          </div>
        )}
        {searchQuery && !isLoading && (
          <button
            onClick={() => {
              setSearchQuery("");
              setResults([]);
              setShowResults(false);
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            ×
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-md shadow-lg z-50 max-h-64 overflow-y-auto">
          {error ? (
            <div className="px-3 py-2 text-sm text-red-600">{error}</div>
          ) : results.length > 0 ? (
            <div className="py-1">
              {/* Header */}
              <div className="px-3 py-2 text-xs text-slate-500 border-b">
                {t("general.foundresults")} {results.length}
              </div>

              {/* Results */}
              {results.map((result, index) => {
                const address = result.address || {};
                const formattedAddress = formatSearchResultAddress(result, t);
                const IconComponent = getSearchResultIconComponent(result);
                const isForeign =
                  address.country_code && address.country_code !== "sk";

                return (
                  <button
                    key={`${result.place_id}-${index}`}
                    onClick={() => handleSelectResult(result)}
                    className="w-full px-3 py-2.5 text-left hover:bg-slate-50 flex items-start gap-3 border-b border-slate-100 last:border-b-0 transition-colors group"
                  >
                    {/* Icon */}
                    <div className="flex items-center justify-center w-6 h-6 mt-0.5 text-slate-600">
                      <IconComponent size={18} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Main address line */}
                      <div className="flex items-start justify-between">
                        <p className="text-sm font-medium text-slate-900 text-left wrap-break-word">
                          {formattedAddress}
                        </p>
                        {isForeign && (
                          <Globe
                            className="text-slate-400 ml-2 shrink-0"
                            size={14}
                          />
                        )}
                      </div>

                      {/* Type and location details */}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs py-0.5 bg-slate-100 text-slate-700 rounded">
                          {translateOSMType(result.type, t)}
                        </span>

                        {address.country_code === "sk" ? (
                          <span className="text-xs text-slate-500">
                            {address.city ||
                              address.town ||
                              address.village ||
                              "Slovakia"}
                          </span>
                        ) : address.country ? (
                          <span className="text-xs text-slate-500">
                            {address.country}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {/* Select indicator */}
                    <MapPin
                      className="text-slate-400 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      size={16}
                    />
                  </button>
                );
              })}
            </div>
          ) : searchQuery.trim().length >= minQueryLength && !isLoading ? (
            <div className="px-3 py-3 text-sm text-slate-500 text-center">
              {t("general.nolocationsfound")} "{searchQuery}"
            </div>
          ) : null}
        </div>
      )}

      <label className="text-left text-xs font-light text-[#64748b]">
        {defaultLabel}
      </label>
    </div>
  );
}
