// src/components/ui/ToggleSwitch.tsx
import React from "react";

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (newState: boolean) => void;
  labels?: { checked: string; unchecked: string };
  className?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  labels,
  className = "",
}) => {
  return (
    <div
      className={`inline-flex items-center cursor-pointer ${className}`}
      onClick={() => onChange(!checked)}
    >
      <div
        className={`relative inline-block w-12 h-6 transition-colors duration-200 ease-linear rounded-full ${
          checked ? "bg-blue-600" : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white shadow transform transition-transform duration-200 ease-linear ${
            checked ? "translate-x-6" : ""
          }`}
        ></span>
      </div>
      {labels && (
        <span className="ml-2 text-sm font-medium">
          {checked ? labels.checked : labels.unchecked}
        </span>
      )}
    </div>
  );
};

export default ToggleSwitch;
