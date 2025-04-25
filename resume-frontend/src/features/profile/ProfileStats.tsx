import { useUserStats } from "@/features/profile/hooks/useUserStats";
import { Loader } from "@/lib/ui/common";
import { FC, SVGProps } from "react";
import {
  ArrowDownTrayIcon,
  EyeIcon,
  HeartIcon,
} from "@heroicons/react/24/solid";
import { TooltipIcon } from "@/lib/ui/common/TooltipIcon";

interface StatCardProps {
  icon: FC<SVGProps<SVGSVGElement>>;
  value: number;
}

export const ProfileStats = () => {
  const { stats, loading } = useUserStats();

  if (loading) return <Loader />;

  return (
    <div className="mb-10 p-6 bg-gray-50 dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Resume Stats
        </h2>
        <TooltipIcon content="These numbers reflect the total views, downloads, and likes of your public resumes only." />
      </div>
      <div className="grid gap-6 grid-cols-[repeat(auto-fit,_minmax(120px,_1fr))]">
        <StatCard icon={EyeIcon} value={stats?.views || 0} />
        <StatCard icon={ArrowDownTrayIcon} value={stats?.downloads || 0} />
        <StatCard icon={HeartIcon} value={stats?.favorites || 0} />
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, value }: Omit<StatCardProps, "label">) => (
  <div className="flex flex-col items-center justify-center w-full min-h-[120px] bg-white dark:bg-zinc-900 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 dark:border-zinc-700">
    <Icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
    <p className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white">
      {value}
    </p>
  </div>
);
