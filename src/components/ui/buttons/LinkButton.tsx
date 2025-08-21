"use client";

import { ReactNode } from "react";
import Link from "next/link";

interface LinkButtonProps {
  children: ReactNode;
  href: string;
  variant?: "default" | "primary" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  className?: string;
  icon?: ReactNode;
  external?: boolean;
}

export default function LinkButton({
  children,
  href,
  variant = "default",
  size = "md",
  className = "",
  icon,
  external = false,
}: LinkButtonProps) {
  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const variantClasses = {
    default: "text-gray-700 hover:text-gray-900 hover:bg-gray-100",
    primary: "text-blue-600 hover:text-blue-700 hover:bg-blue-50",
    danger: "text-red-600 hover:text-red-700 hover:bg-red-50",
    success: "text-green-600 hover:text-green-700 hover:bg-green-50",
  };

  const buttonClasses = `
    inline-flex items-center justify-center rounded-md font-medium 
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
    transition-colors
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${className}
  `;

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonClasses}
      >
        {icon && <span className="mr-2">{icon}</span>}
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={buttonClasses}>
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </Link>
  );
}
