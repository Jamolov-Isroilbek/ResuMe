import { Tooltip } from "react-tooltip";
import { useMemo } from "react";
import { v4 as uuidv4 } from "uuid";

interface TooltipIconProps {
  content: string;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
}

export const TooltipIcon: React.FC<TooltipIconProps> = ({
  content,
  position = "top",
  className = "",
}) => {
  const id = useMemo(() => uuidv4(), []);

  return (
    <>
      <span
        data-tooltip-id={id}
        data-tooltip-content={content}
        className={`ml-1 w-5 h-5 border-2 border-blue-500 dark:border-blue-400 text-blue-500 dark:text-blue-300 rounded-full flex items-center justify-center text-[11px] font-semibold cursor-pointer ${className}`}
      >
        ?
      </span>
      <Tooltip
        id={id}
        place={position}
        className="max-w-[260px] break-words whitespace-pre-wrap text-sm"
      />
    </>
  );
};
