"use client";

import { ReactNode } from "react";

interface SecondaryButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  icon?: ReactNode;
}

export default function SecondaryButton({
  children,
  onClick,
  type = "button",
  disabled = false,
  size = "md",
  className = "",
  icon,
}: SecondaryButtonProps) {
  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center rounded-md border border-gray-300 
        font-medium text-gray-700 bg-white hover:bg-gray-50 
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
        disabled:opacity-50 disabled:cursor-not-allowed transition-colors
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
}
