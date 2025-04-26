// src/components/core/Navigation/Tabs.tsx
interface Tab {
    id: string;
    label: string;
  }
  
  interface TabsProps {
    tabs: Tab[];
    activeTab: string;
    onChange: (tabId: string) => void;
  }
  
  export const Tabs = ({ tabs, activeTab, onChange }: TabsProps) => (
    <div className="flex space-x-4 border-b">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`py-2 px-4 ${
            activeTab === tab.id
              ? "border-b-2 border-blue-500 font-bold text-blue-600 dark:text-blue-400"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );