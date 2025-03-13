// src/components/core/form/InputField.tsx
import React from 'react';

type InputElement = HTMLInputElement | HTMLTextAreaElement;

interface InputFieldProps {
  label: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<InputElement>) => void;
  type?: React.HTMLInputTypeAttribute;
  as?: 'input' | 'textarea';
  placeholder?: string;
  error?: string;
  required?: boolean;
  className?: string;
  step?: string | number;
  min?: string | number;
  max?: string | number;
}

export const InputField = React.forwardRef<InputElement, InputFieldProps>(
  ({ label, as = 'input', className = '', ...props }, ref) => {
    const Element = as;

    return (
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <Element
          ref={ref as any}
          className={`w-full px-3 py-2 border rounded-md ${
            props.error ? 'border-red-500' : 'border-gray-300'
          } focus:ring-2 focus:ring-blue-500`}
          {...props}
        />
        {props.error && <p className="text-red-500 text-sm mt-1">{props.error}</p>}
      </div>
    );
  }
);