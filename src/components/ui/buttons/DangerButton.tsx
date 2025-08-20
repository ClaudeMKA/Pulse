"use client";

import { ReactNode } from "react";

interface DangerButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  loading?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  icon?: ReactNode;
}

export default function DangerButton({
  children,
  onClick,
  type = "button",
  disabled = false,
  loading = false,
  size = "md",
  className = "",
  icon,
}: DangerButtonProps) {
  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center rounded-md border border-transparent 
        font-medium text-white bg-red-600 hover:bg-red-700 
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 
        disabled:opacity-50 disabled:cursor-not-allowed transition-colors
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {icon && !loading && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
}
