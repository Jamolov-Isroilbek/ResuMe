// src/components/core/form/InputField.tsx
import React from "react";

type InputElement = HTMLInputElement | HTMLTextAreaElement;

interface InputFieldProps {
  label: string;
  value: string | number;
  hideLabel?: boolean;
  onChange: (e: React.ChangeEvent<InputElement>) => void;
  type?: React.HTMLInputTypeAttribute;
  as?: "input" | "textarea";
  placeholder?: string;
  error?: string;
  required?: boolean;
  className?: string;
  step?: string | number;
  min?: string | number;
  max?: string | number;
}

export const InputField = React.forwardRef<InputElement, InputFieldProps>(
  (
    { label, as = "input", className = "", hideLabel = false, ...props },
    ref
  ) => {
    const Element = as;

    return (
      <div className="space-y-1">
        {!hideLabel && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <Element
          ref={ref as any}
          className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-zinc-700 text-black dark:text-white ${
            props.error
              ? "border-red-500"
              : "border-gray-300 dark:border-gray-600"
          } focus:ring-2 focus:ring-blue-500 transition-colors`}
          {...props}
        />
        {props.error && (
          <p className="text-red-500 text-sm mt-1">{props.error}</p>
        )}
      </div>
    );
  }
);
