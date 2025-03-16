import { ResumeStatus } from "@/types/shared/resume";

interface ResumeTabsProps {
  activeTab: ResumeStatus;
  setActiveTab: (status: ResumeStatus) => void;
}

// ResumeTabs.tsx
export const ResumeTabs: React.FC<ResumeTabsProps> = ({ activeTab, setActiveTab }) => {
  const orderedStatuses = [
    ResumeStatus.PUBLISHED,
    ResumeStatus.ARCHIVED,
    ResumeStatus.DRAFT
  ];

  return (
    <div className="mb-4 flex space-x-4 border-b">
      {orderedStatuses.map((status) => (
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
};