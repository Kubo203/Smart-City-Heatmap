import { useState } from "react";
import { Logo } from "./header/Logo";
import { HeaderActions } from "./header/HeaderActions";
import { useTranslation } from "react-i18next";

export default function Dashboard() {
  const [activeLang, setActiveLang] = useState<string>("SK");
  const { i18n } = useTranslation();

  const handleLanguageChange = (lang: string) => {
    setActiveLang(lang);
    // This is the critical line - it tells i18next to change the language
    i18n.changeLanguage(lang.toLowerCase()); // "SK" -> "sk", "EN" -> "en"
  };

  return (
    <div className="h-auto p-2 bg-[#fdfdfd] flex flex-row justify-between">
      <div className="hidden md:flex bg-[#fdfdfd] justify-start border-r w-[340px]">
        <Logo />
      </div>

      <HeaderActions
        activeLang={activeLang}
        onLanguageChange={handleLanguageChange}
      />
    </div>
  );
}
