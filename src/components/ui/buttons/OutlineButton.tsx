"use client";

import { ReactNode } from "react";

interface OutlineButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  variant?: "default" | "blue" | "green" | "red" | "gray";
  size?: "sm" | "md" | "lg";
  className?: string;
  icon?: ReactNode;
}

export default function OutlineButton({
  children,
  onClick,
  type = "button",
  disabled = false,
  variant = "default",
  size = "md",
  className = "",
  icon,
}: OutlineButtonProps) {
  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const variantClasses = {
    default: "border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-blue-500",
    blue: "border-blue-300 text-blue-700 hover:bg-blue-50 focus:ring-blue-500",
    green: "border-green-300 text-green-700 hover:bg-green-50 focus:ring-green-500",
    red: "border-red-300 text-red-700 hover:bg-red-50 focus:ring-red-500",
    gray: "border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center rounded-md border 
        font-medium bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 
        disabled:opacity-50 disabled:cursor-not-allowed transition-colors
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
}
