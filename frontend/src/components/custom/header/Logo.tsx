// components/Logo.tsx
interface LogoProps {
  logoUrl?: string;
  logoAlt?: string;
  logoWidth?: string;
  companyName?: string;
  textSize?: string;
  textColor?: string;
  className?: string;
}

export function Logo({
  logoUrl = "/src/assets/logo.png",
  logoAlt = "LOGO",
  logoWidth = "w-[46px] xl:w-[76px]",
  companyName = "HeatSpot",
  textSize = "text-[32px] xl:text-[48px]",
  textColor = "text-[#0f172a]",
  className = "",
}: LogoProps) {
  return (
    <div
      className={`flex w-full justify-center items-center gap-3 ${className}`}
    >
      <img
        src={logoUrl}
        alt={logoAlt}
        className={`${logoWidth} flex justify-center items-center`}
      />
      <p
        className={`${textColor} ${textSize} h-fit font-extrabold flex justify-center items-center`}
      >
        {companyName}
      </p>
    </div>
  );
}
