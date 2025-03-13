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
  className = ""
}) => (
  <div className={`mb-8 p-6 bg-white rounded-lg shadow-sm ${className}`}>
    {title && <h3 className="text-xl font-semibold mb-4">{title}</h3>}
    <div className="space-y-4">
      {children}
    </div>
  </div>
);