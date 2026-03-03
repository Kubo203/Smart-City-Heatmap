import { useTranslation } from "react-i18next";

interface PopupContentProps {
  tags: Record<string, string>;
  address?: string;
}

export function PopupContent({ tags, address }: PopupContentProps) {
  const { t } = useTranslation();
  
  const hasDetails = address || tags.website || tags.phone || tags.opening_hours;

  if (!hasDetails) {
    return (
      <div className="p-2">
        <strong>{tags.name || t("general.unnamedLocation")}</strong>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-between items-start p-2 max-w-xs">
      <h3 className="text-lg font-bold w-full text-center border-b-2 mb-2">
        {tags.name || t("general.unnamedLocation")}
      </h3>

      {address && (
        <p className="w-full text-start mb-1">
          <strong>{t("general.address")}:</strong> {address}
        </p>
      )}

      {tags.website && (
        <p className="w-full text-start mb-1">
          <strong>{t("general.website")}:</strong>{" "}
          <a
            href={tags.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {tags.website}
          </a>
        </p>
      )}

      {tags.phone && (
        <p className="w-full text-start mb-1">
          <strong>{t("general.phone")}:</strong> {tags.phone}
        </p>
      )}

      {tags.opening_hours && (
        <p className="w-full text-start mb-1">
          <strong>{t("general.openingHours")}:</strong> {tags.opening_hours}
        </p>
      )}

      {tags.operator && (
        <p className="w-full text-start mb-1">
          <strong>{t("general.operator")}:</strong> {tags.operator}
        </p>
      )}
    </div>
  );
}

