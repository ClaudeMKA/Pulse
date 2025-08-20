"use client";

import { ReactNode } from "react";

interface IconButtonProps {
  icon: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  variant?: "default" | "primary" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  className?: string;
  title?: string;
}

export default function IconButton({
  icon,
  onClick,
  type = "button",
  disabled = false,
  variant = "default",
  size = "md",
  className = "",
  title,
}: IconButtonProps) {
  const sizeClasses = {
    sm: "p-1.5",
    md: "p-2",
    lg: "p-3",
  };

  const variantClasses = {
    default: "text-gray-400 hover:text-gray-500 hover:bg-gray-100",
    primary: "text-blue-600 hover:text-blue-700 hover:bg-blue-50",
    danger: "text-red-600 hover:text-red-700 hover:bg-red-50",
    success: "text-green-600 hover:text-green-700 hover:bg-green-50",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`
        inline-flex items-center justify-center rounded-md 
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
        disabled:opacity-50 disabled:cursor-not-allowed transition-colors
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {icon}
    </button>
  );
}
