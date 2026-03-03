// components/UserAvatar.tsx
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { cn } from "@/lib/helper"; // Ak používate shadcn/utils

type AvatarSize = "sm" | "md" | "lg" | "xl";
type AvatarShape = "circle" | "square" | "rounded";

interface UserAvatarProps {
  src?: string;
  fallback?: string;
  alt?: string;
  size?: AvatarSize;
  shape?: AvatarShape;
  className?: string;
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-16 h-16",
  xl: "w-20 h-20",
};

const shapeClasses: Record<AvatarShape, string> = {
  circle: "rounded-full",
  square: "rounded-none",
  rounded: "rounded-md",
};

export function UserAvatar({
  src = "https://github.com/shadcn.png",
  fallback = "CN",
  alt = "User avatar",
  size = "lg",
  shape = "circle",
  className = "",
}: UserAvatarProps) {
  return (
    <div
      className={cn(
        "overflow-hidden",
        sizeClasses[size],
        shapeClasses[shape],
        className
      )}
    >
      <Avatar>
        <AvatarImage
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
        />
        <AvatarFallback
          className={cn(
            "w-full h-full flex items-center justify-center bg-gray-100 text-gray-600 font-medium",
            size === "sm" && "text-xs",
            size === "md" && "text-sm",
            size === "lg" && "text-base",
            size === "xl" && "text-lg"
          )}
        >
          {fallback}
        </AvatarFallback>
      </Avatar>
    </div>
  );
}
