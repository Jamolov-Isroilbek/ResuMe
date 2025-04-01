interface PublicResumesTabsProps {
    activeTab: "published" | "favorites";
    setActiveTab: (tab: "published" | "favorites") => void;
  }
  
  export const PublicResumesTabs: React.FC<PublicResumesTabsProps> = ({
    activeTab,
    setActiveTab,
  }) => (
    <div className="mb-4 flex space-x-4 border-b">
      {(["published", "favorites"] as const).map((tab) => (
        <button
          key={tab}
          className={`py-2 px-4 ${
            activeTab === tab
              ? "border-b-2 border-blue-500 font-bold text-black dark:text-white"
              : "text-gray-600 dark:text-gray-400"
          }`}
          
          onClick={() => setActiveTab(tab)}
        >
          {tab.charAt(0).toUpperCase() + tab.slice(1)}
        </button>
      ))}
    </div>
  );