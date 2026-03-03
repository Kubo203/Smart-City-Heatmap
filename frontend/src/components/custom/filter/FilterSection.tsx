// components/FilterSection.tsx
import type { JSX } from "react";
import MultiSelect from "./MultiSelect";
import { SectionHeader, StickyHeader } from "../header/Headers";
import InputSearch from "./InputSearch";
import { Switch } from "@/components/ui/switch";
import { Button } from "../../ui/button";
import { formatAddress } from "@/lib/helper";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";

interface FilterSectionProps {
  onSearchChange?: (value: string) => void;
  selectedFilters: string[];
  onFiltersChange: (filters: string[]) => void;
  filterSections: Array<{
    placeholder: string;
    options: Array<{ label: string; value: string; icon: JSX.Element }>;
  }>;
  showPins: boolean;
  showFilter: boolean;
  setShowFilter: (show: boolean) => void;
  onShowPinsChange: (show: boolean) => void;
  applyFilter: () => void;
  onLocationChange: (location: {
    name: string;
    lat: string;
    lon: string;
    boundingbox?: [string, string, string, string];
  }) => void;
}

export function FilterSection({
  selectedFilters,
  onFiltersChange,
  filterSections,
  showPins,
  showFilter,
  setShowFilter,
  onShowPinsChange,
  applyFilter,
  onLocationChange,
}: FilterSectionProps) {
  const { t } = useTranslation();
  return (
    <div
      className={`fixed md:relative top-0 left-0 z-100 w-[340px] h-full bg-[#fdfdfd] flex flex-col p-4 lg:px-3 text-[#0f172a] border-t lg:border-r border-[#e5e7eb] z-10 transform transition-transform ${
        showFilter ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0`}
    >
      {/* Search Section */}
      <div className="h-fit w-full shrink-0">
        <div className="flex flex-col gap-4 lg:gap-5 lg:mx-3">
          <div className="flex items-center justify-between">
            <SectionHeader>{t("general.address")}</SectionHeader>
            <button className="md:hidden" onClick={()=>setShowFilter(false)}>
              <X size={32} />
            </button>
          </div>
          <InputSearch
            onSelectLocation={(location) => {
              onLocationChange({
                name: formatAddress(location),
                lat: location.lat,
                lon: location.lon,
                boundingbox: location.boundingbox,
              });
            }}
          />
        </div>
      </div>

      {/* Filters Section */}
      <div className="flex-1 min-h-0 flex flex-col relative">
        <StickyHeader>{t("general.filter")}</StickyHeader>
        <div className="flex-1 min-h-0 overflow-y-auto lg:px-3 py-4 lg:py-5">
          <div className="flex flex-col gap-4 lg:gap-5">
            {filterSections.map((section) => (
              <MultiSelect
                key={section.placeholder}
                options={section.options}
                value={selectedFilters}
                onChange={onFiltersChange}
                placeholder={section.placeholder}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Toggle Section */}
      <div className="w-full pt-4 bg-[#fdfdfd] border-t border-[#e5e7eb]">
        <div className="flex justify-evenly items-center w-full h-full ">
          <div className="flex gap-2">
            <Switch checked={showPins} onCheckedChange={onShowPinsChange} />
            <p className="text-sm lg:text-[14px] font-medium">{t("general.showpins")}</p>
          </div>
          <Button onClick={applyFilter}>{t("general.fileterresults")}</Button>
        </div>
      </div>
    </div>
  );
}
