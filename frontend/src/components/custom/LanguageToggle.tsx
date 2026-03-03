// components/LanguageToggle.tsx
interface LanguageToggleProps {
  activeLang: string;
  onLanguageChange: (lang: string) => void;
}

export function LanguageToggle({
  activeLang,
  onLanguageChange,
}: LanguageToggleProps) {
  const languages = [
    { code: "SK", label: "SK" },
    { code: "EN", label: "EN" },
  ];

  return (
    <div className="flex items-center h-fit gap-1 p-1 border border-[#cbd5e1] rounded-md">
      {languages.map((lang) => (
        <button
          key={lang.code}
          className={`px-2 lg:px-3 py-1 text-sm rounded-sm font-medium transition-colors ease-in-out duration-500 ${
            activeLang === lang.code
              ? "text-[#0f172a] bg-[#f1f5f9]"
              : "text-gray-400 hover:text-gray-600"
          }`}
          onClick={() => onLanguageChange(lang.code)}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
