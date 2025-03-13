// src/components/core/Form/FormCard.tsx
import React from "react";
import { Button } from "@/lib/ui/buttons/Button";
import { cn } from "@/lib/utils/helpers";

interface FormCardProps {
  children: React.ReactNode;
  onRemove?: () => void;
  className?: string;
}

export const FormCard: React.FC<FormCardProps> = ({
  children,
  onRemove,
  className = ""
}) => (
  <div className={cn("relative border p-4 rounded-lg mb-4", className)}>
    {children}
    {onRemove && (
      <Button
        variant="danger"
        size="sm"
        className="absolute top-2 right-2"
        onClick={onRemove}
        aria-label="Remove section"
      >
        &times;
      </Button>
    )}
  </div>
);