import { SortingDropdown } from "@/lib/ui/buttons/SortingDropdown";
import { SearchInput } from "@/lib/ui/forms/SearchInput";
import { Tooltip } from "react-tooltip";

interface PublicResumesHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortOption: string;
  setSortOption: (option: string) => void;
}

export const PublicResumesHeader: React.FC<PublicResumesHeaderProps> = ({
  searchQuery,
  setSearchQuery,
  sortOption,
  setSortOption,
}) => (
  <div className="mb-8 flex flex-col sm:flex-row items-center justify-between">
    <SearchInput
      value={searchQuery}
      onChange={setSearchQuery}
      placeholder="Search by title..."
    />

    <SortingDropdown
      sortOption={sortOption}
      setSortOption={setSortOption}
      data-tooltip-id="sort-tooltip"
    />
  </div>
);
