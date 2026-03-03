import L from "leaflet";
import { Marker } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import { CustomPopup } from "./CustomPopup";
import "./CustomPin.css";

interface CustomPinProps {
  position: LatLngExpression;
  size?: number;
  color?: string;
  label?: string;
  children?: React.ReactNode;
  popupContent?: React.ReactNode;
  pulse?: boolean;
  onClick?: () => void;
}

export function CustomPin({
  position,
  size = 32,
  color = "#7dba74", // Green color
  label = "Center",
  children,
  popupContent,
  pulse = true,
  onClick,
}: CustomPinProps) {
  const containerSize = size * 3;

  // Create HTML string for Leaflet divIcon
  const createPinHtml = () => {
    return `
      <div class="center-pin-container">
        <div 
          class="center-pin ${pulse ? "pulse" : ""}" 
          style="
            width: ${containerSize}px;
            height: ${containerSize}px;
            --pin-color: ${color};
          "
        >
          <!-- Pin SVG -->
          <svg 
            class="center-pin-svg" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="${color}" 
            stroke="rgba(0,0,0,0.6)" 
            stroke-width="1.5"
          >
            <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/>
            <circle cx="12" cy="10" r="4" fill="white" stroke="black" stroke-width="1"/>
          </svg>
          
          <!-- Pulsing rings -->
          ${
            pulse
              ? `
            <div class="pulse-ring ring-1"></div>
            <div class="pulse-ring ring-2"></div>
          `
              : ""
          }
          
          <!-- Label -->
          ${
            label
              ? `
            <div class="center-label" style="background: ${color};">${label}</div>
          `
              : ""
          }
        </div>
      </div>
    `;
  };

  const customIcon = L.divIcon({
    html: createPinHtml(),
    className: "center-pin-container",
    iconSize: [containerSize, containerSize],
    iconAnchor: [containerSize / 2, containerSize * 0.9],
    popupAnchor: [0, -containerSize * 0.8],
  });

  return (
    <Marker
      position={position}
      icon={customIcon}
      eventHandlers={{ click: onClick }}
    >
      {(popupContent || children) && (
        <CustomPopup color={color}>{popupContent || children}</CustomPopup>
      )}
    </Marker>
  );
}
