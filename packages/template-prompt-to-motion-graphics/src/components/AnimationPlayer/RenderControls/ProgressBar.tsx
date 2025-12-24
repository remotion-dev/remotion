import React from "react";

export const ProgressBar: React.FC<{
  progress: number;
}> = ({ progress }) => {
  const percentage = Math.round(progress * 100);

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Rendering...</span>
        <span className="font-medium">{percentage}%</span>
      </div>
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
