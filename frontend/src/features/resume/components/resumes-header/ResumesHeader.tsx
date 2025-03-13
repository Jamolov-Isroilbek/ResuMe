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
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold">My Resumes</h1>
      <div className="flex items-center gap-4">
        <SortingDropdown
          sortOption={sortOption}
          setSortOption={setSortOption}
        />
        <Button variant="primary" onClick={() => navigate("/create-resume")}>
          Create New
        </Button>
      </div>
    </div>
  );
};