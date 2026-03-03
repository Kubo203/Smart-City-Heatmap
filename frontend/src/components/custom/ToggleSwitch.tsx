// components/ToggleSwitch.tsx
import { Switch } from "../ui/switch";
import type { ReactNode } from "react";

interface ToggleSwitchProps {
  // Základné props
  label: string | ReactNode;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;

  // Layout a pozícia
  layout?: "horizontal" | "vertical";
  labelPosition?: "left" | "right";
  align?: "start" | "center" | "end";

  // Štýlovanie
  className?: string;
  containerClassName?: string;
  labelClassName?: string;
  switchClassName?: string;

  // Stav a vlastnosti
  disabled?: boolean;
  required?: boolean;
  size?: "sm" | "md" | "lg";

  // Pokročilé
  id?: string;
  name?: string;
  form?: string;
  description?: string | ReactNode;
}

const sizeClasses = {
  sm: "text-xs gap-1",
  md: "text-sm gap-2",
  lg: "text-base gap-3",
};

const layoutClasses = {
  horizontal: "flex-row",
  vertical: "flex-col",
};

const alignClasses = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
};

export function ToggleSwitch({
  label,
  checked,
  onCheckedChange,

  // Layout
  layout = "horizontal",
  labelPosition = "right",
  align = "center",

  // Štýlovanie
  className = "",
  containerClassName = "",
  labelClassName = "",
  switchClassName = "",

  // Stav
  disabled = false,
  required = false,
  size = "md",

  // Pokročilé
  id,
  name,
  form,
  description,
}: ToggleSwitchProps) {
  const generatedId = id || `toggle-${Math.random().toString(36).substr(2, 9)}`;

  const renderLabel = () => (
    <label
      htmlFor={generatedId}
      className={`
        font-medium select-none h-full flex items-center
        ${
          disabled
            ? "text-gray-400 cursor-not-allowed"
            : "text-gray-700 cursor-pointer"
        }
        ${labelClassName}
      `}
    >
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );

  const renderDescription = () => {
    if (!description) return null;

    return (
      <p
        className={`
        text-xs mt-1
        ${disabled ? "text-gray-400" : "text-gray-500"}
      `}
      >
        {description}
      </p>
    );
  };

  return (
    <div className={`${className}`}>
      <div
        className={`
        flex z-100 ${layoutClasses[layout]} ${alignClasses[align]}
        ${sizeClasses[size]}
        ${containerClassName}
      `}
      >
        {/* Label na ľavej strane */}
        {labelPosition === "left" && renderLabel()}

        {/* Switch */}
        <Switch
          id={generatedId}
          name={name}
          form={form}
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
          className={switchClassName}
        />

        {/* Label na pravej strane */}
        {labelPosition === "right" && renderLabel()}
      </div>

      {/* Description */}
      {renderDescription()}
    </div>
  );
}
