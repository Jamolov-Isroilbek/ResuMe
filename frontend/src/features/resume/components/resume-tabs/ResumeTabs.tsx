// src/features/resume/components/resume-tabs/ResumeTabs.tsx
import { ResumeStatus } from "@/types/shared/resume";

interface ResumeTabsProps {
  activeTab: ResumeStatus;
  setActiveTab: (status: ResumeStatus) => void;
}

export const ResumeTabs: React.FC<ResumeTabsProps> = ({ activeTab, setActiveTab }) => (
  <div className="mb-4 flex space-x-4 border-b">
    {Object.values(ResumeStatus).map((status) => (
      <button
        key={status}
        className={`py-2 px-4 ${
          activeTab === status ? "border-b-2 border-blue-500 font-bold" : ""
        }`}
        onClick={() => setActiveTab(status)}
      >
        {status.charAt(0) + status.slice(1).toLowerCase()}
      </button>
    ))}
  </div>
);