// src/components/ui/Button.tsx
import React from 'react';

type ButtonVariant = 
  | 'primary' 
  | 'secondary' 
  | 'danger'
  | 'ghost'
  | 'success'
  | 'warning'
  | 'info';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize | "icon";
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  const baseClasses = "rounded-md transition-colors font-medium";
  
  const sizeClasses = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
    icon: "p-2"
  };

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-zinc-700 dark:text-gray-100 dark:hover:bg-zinc-600',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-zinc-700',
    success: 'bg-green-500 text-white hover:bg-green-600',
    warning: 'bg-orange-500 text-white hover:bg-orange-600',
    info: 'bg-blue-500 text-white hover:bg-blue-600'
  };
  

  return (
    <button
      aria-label={props['aria-label'] || children?.toString()}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};