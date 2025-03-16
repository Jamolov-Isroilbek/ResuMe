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
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
    <div className="flex items-center gap-4">
      <Icon className="h-8 w-8 text-blue-600" />
      <div>
        <p className="text-sm font-medium text-gray-600">{label}</p>
        <p className="text-3xl font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);