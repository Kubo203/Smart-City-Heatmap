import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";


export const NavBar: React.FC = () => {
    const { t } = useTranslation();

  return (
    <nav className="w-full flex items-center gap-10 md:gap-15 lg:gap-20 justify-start">
      <Link
        to="/"
        className="text-center rounded-lg bg-white md:text-lg font-semibold text-gray-700 hover:font-bold focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
        style={{ minWidth: 0 }}
      >
        {t("navbar.map")}
      </Link>
      <Link
        to="/instruction"
        className="text-center rounded-lg bg-white md:text-lg font-semibold text-gray-700 hover:font-bold focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
        style={{ minWidth: 0 }}
      >
        {t("navbar.instruction")}
      </Link>
    </nav>
  );
};

