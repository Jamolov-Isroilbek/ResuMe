// src/components/ui/SortingDropdown.tsx
import React from "react";
import { defaultOrderingMapping } from "@/lib/utils/orderingMapping";

export interface OrderingMapping {
  [option: string]: string;
}

export interface SortingDropdownProps {
  sortOption: string;
  setSortOption: (option: string) => void;
  orderingMapping?: Record<string, string>;
}

export const SortingDropdown: React.FC<SortingDropdownProps> = ({
  sortOption,
  setSortOption,
  orderingMapping = defaultOrderingMapping,
}) => {
  return (
    <select
      value={sortOption}
      onChange={(e) => setSortOption(e.target.value)}
      className="w-full sm:w-1/4 px-4 py-2 p-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:text-white dark:border-zinc-600"
    >
      {Object.keys(orderingMapping).map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
};
