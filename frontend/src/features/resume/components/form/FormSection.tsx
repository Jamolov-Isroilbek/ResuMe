// src/components/core/Form/FormSection.tsx
import { TooltipIcon } from "@/lib/ui/common/TooltipIcon";
import React from "react";

interface FormSectionProps {
  title?: string;
  tooltip?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  tooltip,
  children,
  className = "",
}) => (
  <div
    className={`mb-8 p-6 bg-white dark:bg-zinc-800 text-black dark:text-white rounded-lg shadow-sm transition-colors ${className}`}
  >
    {title && (
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        {tooltip && <TooltipIcon content={tooltip} />}
      </div>
    )}
    <div className="space-y-4">{children}</div>
  </div>
);
