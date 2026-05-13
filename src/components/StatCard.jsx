import React from "react";

export default function StatCard({
  label,
  value,
  sub,
  trend,
  color = "emerald",
  icon,
}) {
  const isPositive = trend > 0;
  const trendColor = isPositive ? "text-emerald-400" : "text-red-400";
  const trendIcon = isPositive ? "↑" : "↓";

  const colorMap = {
    emerald: "text-emerald-400",
    amber: "text-amber-400",
    blue: "text-blue-400",
    rose: "text-rose-400",
    purple: "text-purple-400",
    indigo: "text-indigo-400",
  };

  const textColor = colorMap[color] || "text-emerald-400";
  
  // Get gradient color based on the color prop
  const gradientColorMap = {
    emerald: "from-emerald-500/20 to-transparent",
    amber: "from-amber-500/20 to-transparent",
    blue: "from-blue-500/20 to-transparent",
    rose: "from-rose-500/20 to-transparent",
    purple: "from-purple-500/20 to-transparent",
    indigo: "from-indigo-500/20 to-transparent",
  };
  
  const gradientColor = gradientColorMap[color] || "from-emerald-500/20 to-transparent";

  return (
    <div className="relative bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5 card-hover overflow-hidden">
      {/* Gradient background - fixed to match the color theme */}
      <div 
        className={`absolute top-0 right-0 w-32 h-32 pointer-events-none bg-gradient-to-bl ${gradientColor} rounded-full opacity-60`}
        style={{ transform: 'translate(20px, -20px)' }}
      />

      <div className="flex justify-between items-start mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 truncate">
          {label}
        </span>
        {icon && (
          <span className="text-lg opacity-70 text-gray-400 dark:text-gray-500">
            {icon}
          </span>
        )}
      </div>

      <div
        className={`font-display text-xl sm:text-2xl lg:text-3xl font-bold ${textColor} mb-2 leading-tight truncate`}
        title={value}
      >
        {value}
      </div>

      <div className="flex items-center gap-2">
        {trend !== undefined && (
          <span className={`text-xs font-semibold ${trendColor}`}>
            {trendIcon} {Math.abs(trend)}%
          </span>
        )}
        {sub && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {sub}
          </span>
        )}
      </div>
    </div>
  );
}