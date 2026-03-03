import { Popup } from "react-leaflet";
import { useEffect, useRef } from "react";
import type { Popup as LeafletPopup } from "leaflet";
import "./CustomPopup.css";

interface CustomPopupProps {
  children?: React.ReactNode;
  popupContent?: React.ReactNode;
  color?: string;
  className?: string;
}

export function CustomPopup({
  children,
  popupContent,
  color,
  className = "",
}: CustomPopupProps) {
  const popupRef = useRef<LeafletPopup>(null);

  // Set CSS custom property on the popup element
  useEffect(() => {
    if (!popupRef.current) return;

    const updateColor = () => {
      const element = popupRef.current?.getElement();
      if (element && color) {
        element.style.setProperty("--popup-border-color", color);
      }
    };

    // Update color when popup opens
    const popup = popupRef.current;
    popup.on("add", updateColor);
    updateColor(); // Initial update

    return () => {
      popup.off("add", updateColor);
    };
  }, [color]);

  return (
    <Popup ref={popupRef} className={`custom-popup ${className}`.trim()}>
      <div className="px-1">{children || popupContent}</div>
    </Popup>
  );
}
