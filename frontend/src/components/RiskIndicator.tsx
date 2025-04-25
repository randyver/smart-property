"use client";

interface RiskIndicatorProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export default function RiskIndicator({
  score,
  size = "md",
  showLabel = true,
  className = "",
}: RiskIndicatorProps) {
  // Get color based on score
  const getColor = (score: number): string => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    if (score >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  // Get label based on score
  const getLabel = (score: number): string => {
    if (score >= 80) return "Aman";
    if (score >= 60) return "Sedang";
    if (score >= 40) return "Waspada";
    return "Risiko Tinggi";
  };

  // Get size classes
  const getSizeClasses = (size: string): string => {
    switch (size) {
      case "sm":
        return "w-6 h-6 text-xs";
      case "lg":
        return "w-14 h-14 text-lg";
      default:
        return "w-10 h-10 text-sm";
    }
  };

  const colorClass = getColor(score);
  const sizeClasses = getSizeClasses(size);

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div
        className={`${colorClass} ${sizeClasses} rounded-full flex items-center justify-center text-white font-bold`}
      >
        {score}
      </div>
      {showLabel && (
        <span className="mt-1 text-xs font-medium text-gray-700">
          {getLabel(score)}
        </span>
      )}
    </div>
  );
}
