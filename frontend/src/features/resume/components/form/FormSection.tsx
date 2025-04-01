// src/components/core/Form/FormSection.tsx
import React from "react";

interface FormSectionProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  children,
  className = "",
}) => (
  <div
    className={`mb-8 p-6 bg-white dark:bg-zinc-800 text-black dark:text-white rounded-lg shadow-sm transition-colors ${className}`}
  >
    {title && (
      <h3 className="text-xl font-semibold mb-4 text-black dark:text-white">
        {title}
      </h3>
    )}
    <div className="space-y-4">{children}</div>
  </div>
);
