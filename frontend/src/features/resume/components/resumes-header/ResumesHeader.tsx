// src/features/resume/components/resumes-header/ResumesHeader.tsx
import { Button } from "@/lib/ui/buttons/Button";
import { SortingDropdown } from "@/lib/ui/buttons/SortingDropdown";
import { useNavigate } from "react-router-dom";

interface ResumesHeaderProps {
  sortOption: string;
  setSortOption: (option: string) => void;
}

export const ResumesHeader: React.FC<ResumesHeaderProps> = ({ 
  sortOption, 
  setSortOption 
}) => {
  const navigate = useNavigate();

  return (
    <div className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
      <h2 className="text-3xl font-bold text-center mb-6">My Resumes</h2>
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <SortingDropdown
          sortOption={sortOption}
          setSortOption={setSortOption}
        />
        <Button 
          variant="primary" 
          onClick={() => navigate("/create-resume")}
          className="w-full sm:w-auto"
        >
          Create New
        </Button>
      </div>
    </div>
  );
};