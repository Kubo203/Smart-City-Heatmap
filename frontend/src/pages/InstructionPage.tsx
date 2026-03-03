import React from "react";
import { useTranslation } from "react-i18next";

const InstructionPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-start justify-start h-full w-full bg-gray-50 p-8 overflow-y-auto">
      <h1 className="text-3xl font-bold mb-4">{t("credits.title")}</h1>
      <p className="text-lg text-gray-700 mb-6">
        {t("credits.description")}
      </p>
      
      <div className="space-y-6 w-full max-w-4xl">
        {/* OpenStreetMap Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-3 text-gray-800">{t("credits.osm.title")}</h2>
          <p className="text-gray-700 mb-3">{t("credits.osm.description")}</p>
          <p className="text-gray-700 font-medium mb-3">{t("credits.osm.attribution")}</p>
          <div className="flex flex-wrap gap-4 text-sm">
            <a 
              href={t("credits.osm.licenseLink")} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              {t("credits.osm.licenseText")}
            </a>
            <span className="text-gray-400">|</span>
            <a 
              href={t("credits.osm.copyrightLink")} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              {t("credits.osm.copyrightText")}
            </a>
          </div>
        </div>

        {/* Overpass API Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-3 text-gray-800">{t("credits.overpass.title")}</h2>
          <p className="text-gray-700 mb-3">{t("credits.overpass.description")}</p>
          <a 
            href={t("credits.overpass.link")} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline text-sm"
          >
            {t("credits.overpass.linkText")}
          </a>
        </div>

        {/* Globe.gl Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-3 text-gray-800">{t("credits.globe.title")}</h2>
          <p className="text-gray-700 mb-3">{t("credits.globe.description")}</p>
          <p className="text-gray-700 font-medium mb-3">{t("credits.globe.attribution")}</p>
          <a 
            href={t("credits.globe.link")} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline text-sm"
          >
            {t("credits.globe.linkText")}
          </a>
        </div>
      </div>
    </div>
  );
};

export default InstructionPage;
