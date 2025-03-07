import React from 'react';
import { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement>;
type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

type FormFieldProps = {
  label: string;
  error?: string;
  as?: 'input' | 'textarea';
} & (InputProps | TextareaProps);

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  as = 'input',
  ...props
}) => {
  const Component = as === 'textarea' ? 'textarea' : 'input';
  
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <Component
        className={`w-full px-3 py-2 border rounded-md ${
          error ? 'border-red-500' : 'border-gray-300'
        } focus:ring-2 focus:ring-blue-500 ${props.className || ''}`}
        {...props as any}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};