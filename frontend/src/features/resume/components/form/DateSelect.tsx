// src/components/core/Form/DateSelect.tsx
import { months, years } from "@/lib/utils/dateUtils";

interface DateSelectProps {
  label: string;
  month: string;
  year: string;
  disabled?: boolean;
  onMonthChange: (month: string) => void;
  onYearChange: (year: string) => void;
}

export const DateSelect = ({
  label,
  month,
  year,
  disabled,
  onMonthChange,
  onYearChange,
}: DateSelectProps) => (
  <div className="space-y-1">
    <label className="text-sm font-medium text-gray-700 dark:text-gray-200">{label}</label>
    <div className="flex gap-2">
      <select
        value={month}
        onChange={(e) => onMonthChange(e.target.value)}
        className="w-full p-2 border rounded-md bg-white dark:bg-zinc-700 text-black dark:text-white"
        disabled={disabled}
      >
        <option value="">Month</option>
        {months.map((m) => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>
      <select
        value={year}
        onChange={(e) => onYearChange(e.target.value)}
        className="w-full p-2 border rounded-md bg-white dark:bg-zinc-700 text-black dark:text-white"
        disabled={disabled}
      >
        <option value="">Year</option>
        {years.map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>
    </div>
  </div>
);