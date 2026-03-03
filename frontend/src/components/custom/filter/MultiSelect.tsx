import * as React from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/helper";
import type { MultiSelectOption } from "@/utils/types";
import { useTranslation } from "react-i18next";

export default function MultiSelect({
  options,
  placeholder,
  showSelected = false,
  value = [],
  onChange,
}: {
  options: MultiSelectOption[];
  placeholder?: string;
  showSelected?: boolean;
  value: string[];
  onChange: (selected: string[]) => void;
}) {
  const { t } = useTranslation();
  const defaultPlaceholder = placeholder ?? t("general.selectoptions");
  const [open, setOpen] = React.useState(false);

  const toggleValue = (val: string) => {
    const newSelected = value.includes(val)
      ? value.filter((v) => v !== val)
      : [...value, val];
    onChange?.(newSelected);
    console.log({ value });
  };

  return (
    <div className="w-full h-fit relative">
      <Button
        variant="outline"
        onClick={() => setOpen(!open)}
        className={cn(
          "w-full justify-between border! border-[#e5e7eb]! transition-all duration-300 ease-in-out",
          open ? "rounded-b-none shadow-sm" : "rounded-md shadow-sm"
        )}
      >
        {showSelected && value.length > 0
          ? `${value.length} ${t("general.selected")}`
          : defaultPlaceholder}
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform duration-300 ease-in-out",
            !open ? "-rotate-90" : ""
          )}
        />
      </Button>
      <div
        className={cn(
          "relative z-50 w-full h-fit bg-white border! border-[#e5e7eb] border-t-0! rounded-b-md shadow-lg overflow-hidden transition-all duration-300 ease-in-out",
          open
            ? "opacity-100 max-h-72"
            : "opacity-0 max-h-0 pointer-events-none"
        )}
      >
        {options.map((option) => (
          <label
            key={option.value}
            className="flex items-center h-fit justify-between px-3 py-2 cursor-pointer hover:bg-slate-50 transition-colors duration-200"
          >
            <div className="w-fit flex flex-row justify-center items-center gap-4">
              <span className="w-4 h-4">{option.icon}</span>
              <span className="text-sm">{option.label}</span>
            </div>
            <Checkbox
              checked={value.includes(option.value)}
              onCheckedChange={() => toggleValue(option.value)}
              className="h-4 w-4 border border-[#e5e7eb] data-[state=checked]:bg-[#7eba74]! data-[state=checked]:text-[#e5e7eb] data-[state=checked]:border-none transition-colors duration-200"
            />
          </label>
        ))}
      </div>
    </div>
  );
}
