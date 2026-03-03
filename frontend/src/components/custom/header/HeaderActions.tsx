import { LanguageToggle } from "../LanguageToggle";
import { NavBar } from "./NavBar";
import { Button } from "../../ui/button";
import { useNavigate } from "react-router-dom";
import { logout } from "../../../lib/auth";
import { useTranslation } from "react-i18next";
import { LogOut } from "lucide-react";

interface HeaderActionsProps {
  activeLang: string;
  onLanguageChange: (lang: string) => void;
}

export function HeaderActions({
  activeLang,
  onLanguageChange,
}: HeaderActionsProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      // Even if logout API call fails, clear tokens and redirect
      navigate("/login", { replace: true });
    }
  };

  return (
    <>
      {/* Navigation Section - Takes remaining space */}
      <div className="flex-1 flex items-center h-full px-10 md:px-15 lg:px-20">
        <NavBar />
      </div>

      {/* Actions Section - Fixed width for language and logout button */}
      <div className="flex items-center gap-6 h-full px-6">
        <LanguageToggle
          activeLang={activeLang}
          onLanguageChange={onLanguageChange}
        />
        <Button
          onClick={handleLogout}
          type="button"
          className="h-fit px-4 rounded-xl border border-slate-300 bg-white text-slate-900 hover:bg-slate-50 flex items-center justify-center"
        >
          <LogOut className="h-4 w-4" />
          {t("general.logout")}
        </Button>
      </div>
    </>
  );
}
