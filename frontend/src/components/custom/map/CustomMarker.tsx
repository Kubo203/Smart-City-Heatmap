/* eslint-disable @typescript-eslint/no-explicit-any */
import L from "leaflet";
import { Marker } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import { ICON_PRESETS } from "@/const/filters";
import { CustomPopup } from "./CustomPopup";
import "./CustomMarker.css";

interface CustomMarkerProps {
  position: LatLngExpression;
  size?: number;
  color?: string;
  iconName?: keyof typeof ICON_PRESETS;
  label?: string;
  children?: React.ReactNode;
  onClick?: (e?: any) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  className?: string;
  showCount?: number;
  rotation?: number;
  popupContent?: React.ReactNode;
}
export function CustomMarker({
  position,
  size = 42,
  color = "#3b82f6",
  iconName = "bus",
  label = "",
  children,
  onClick,
  onMouseEnter,
  onMouseLeave,
  className = "",
  showCount,
  rotation = 0,
  popupContent,
}: CustomMarkerProps) {
  const containerSize = size * 1.8;
  const pinSize = size;
  const iconSizeContainer = Math.round(size * 0.45);
  const iconSize = Math.round(size * 0.4);

  // Get icon SVG with the specified color
  const getIconSvg = () => {
    const iconFunction = ICON_PRESETS[iconName];
    if (!iconFunction) {
      return ICON_PRESETS.school(color, iconSize);
    }
    return iconFunction("black", iconSize);
  };

  const iconSvg = getIconSvg();

  // Create HTML string for Leaflet divIcon
  // const createMarkerHtml = () => {
  //   return `
  //     <div class="leaflet-custom-marker-container">
  //       <div
  //         class="leaflet-custom-marker"
  //         style="width: ${containerSize}px; height: ${containerSize}px; --marker-color: ${color};"
  //       >
  //         <div class="pin-visual" style="width: ${pinSize}px; height: ${pinSize}px;">
  //           <!-- Pin SVG (bottom layer) -->
  //           <svg
  //             class="marker-svg"
  //             xmlns="http://www.w3.org/2000/svg"
  //             viewBox="0 0 24 24"
  //             fill="${color}"
  //             stroke="rgba(0,0,0,0.6)"
  //             stroke-width="1.5"
  //           >
  //             <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/>
  //           </svg>

  //           <!-- White circle background (middle layer) -->
  //           <div class="icon-background" style="width: ${iconSizeContainer}px; height: ${iconSizeContainer}px;"></div>

  //           <!-- Icon container (top layer) -->
  //           <div
  //             class="icon-container"
  //             style="width: ${iconSize}px; height: ${iconSize}px;"
  //           >
  //             ${iconSvg}
  //           </div>
  //         </div>

  //         <!-- Label -->
  //         ${
  //           label
  //             ? `<div class="marker-label" style="background: ${color};">${label}</div>`
  //             : ""
  //         }
  //       </div>
  //     </div>
  //   `;
  // };

  const createMarkerHtml = () => {
    const countHtml = showCount
      ? `
      <div class="icon-background" style="width: ${iconSizeContainer}px; height: ${iconSizeContainer}px; top: 40%;"></div>
      <div class="icon-container" style="width: ${iconSize}px; height: ${iconSize}px; top: 40%; font-size: ${Math.round(size * 0.25)}px; font-weight: bold; color: black;">${showCount}</div>`
      : "";
    const iconHtml = !showCount
      ? `
      <div class="icon-background" style="width: ${iconSizeContainer}px; height: ${iconSizeContainer}px; top: 40%;"></div>
      <div class="icon-container" style="width: ${iconSize}px; height: ${iconSize}px; top: 40%;">${iconSvg}</div>`
      : "";

    const rotateStyle =
      rotation !== 0 ? `transform: rotate(${rotation}deg);` : "";

    return `
    <div class="leaflet-custom-marker-container">
      <div 
        class="leaflet-custom-marker" 
        style="width: ${containerSize}px; height: ${containerSize}px; --marker-color: ${color}; ${rotateStyle}"
      >
        <div class="pin-visual" style="width: ${pinSize}px; height: ${pinSize}px; position: relative;">
          <svg 
            class="marker-svg" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="${color}" 
            stroke="rgba(0,0,0,0.4)" 
            stroke-width="1"
            style="display: block;"
          >
            <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/>
          </svg>
          ${showCount ? countHtml : iconHtml}
        </div>
        ${
          label
            ? `<div class="marker-label" style="background: ${color};">${label}</div>`
            : ""
        }
      </div>
    </div>
  `;
  };

  const customIcon = L.divIcon({
    html: createMarkerHtml(),
    className: `leaflet-custom-marker-container ${className}`, // Add className here
    iconSize: [containerSize, containerSize],
    iconAnchor: [containerSize / 2, containerSize * 0.85],
    popupAnchor: [0, -containerSize * 0.7],
  });

  return (
    <Marker
      position={position}
      icon={customIcon}
      eventHandlers={{
        add: (e) => {
          const marker = e.target;
          marker.options.color = color;
          marker.options.data = { ...marker.options.data, color };
        },
        click: () => onClick?.(),
        mouseover: () => onMouseEnter?.(),
        mouseout: () => onMouseLeave?.(),
      }}
    >
      {(popupContent || children) && (
        <CustomPopup color={color}>{popupContent || children}</CustomPopup>
      )}
    </Marker>
  );
}
