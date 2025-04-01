import { useUserStats } from "@/features/profile/hooks/useUserStats";
import { Loader } from "@/lib/ui/common";
import { FC, SVGProps } from "react";
import { ArrowDownTrayIcon, EyeIcon, HeartIcon } from "@heroicons/react/24/solid";


interface StatCardProps {
    icon: FC<SVGProps<SVGSVGElement>>;
    label: string;
    value: number;
  }
  
export const ProfileStats = () => {
  const { stats, loading } = useUserStats();

  if (loading) return <Loader />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard 
        icon={EyeIcon}
        label="Total Views"
        value={stats?.views || 0}
      />
      <StatCard
        icon={ArrowDownTrayIcon}
        label="Total Downloads"
        value={stats?.downloads || 0}
      />
      <StatCard
        icon={HeartIcon}
        label="Total Favorites"
        value={stats?.favorites || 0}
      />
    </div>
  );
};




const StatCard = ({ icon: Icon, label, value }: StatCardProps) => (
  <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-zinc-700">
    <div className="flex items-center gap-4">
      <Icon className="h-8 w-8 text-blue-600" />
      <div>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{label}</p>
        <p className="text-3xl font-semibold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  </div>
);
