// src/components/core/Form/RadioGroup.tsx
interface RadioGroupProps {
  options: { value: string; label: string }[];
  selectedValue: string;
  onChange: (value: string) => void;
}

export const RadioGroup = ({
  options,
  selectedValue,
  onChange,
}: RadioGroupProps) => (
  <div className="flex items-center gap-4">
    {options.map((option) => (
      <label key={option.value} className="flex items-center gap-1">
        <input
          type="radio"
          value={option.value}
          checked={selectedValue === option.value}
          onChange={(e) => onChange(e.target.value)}
          className="h-4 w-4"
        />
        <span className="text-gray-800 dark:text-gray-200">{option.label}</span>
      </label>
    ))}
  </div>
);
