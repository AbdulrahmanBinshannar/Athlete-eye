"use client";

import { cn } from "@/lib/utils";

export default function TrafficLight({ score, size = "lg" }: { score: number, size?: "sm" | "lg" }) {
  const isLarge = size === "lg";
  
  const getColors = () => {
    if (score >= 80) return { main: "text-primary", bg: "bg-primary/20", border: "border-primary", shadow: "shadow-primary/40" };
    if (score >= 60) return { main: "text-warning", bg: "bg-warning/20", border: "border-warning", shadow: "shadow-warning/40" };
    return { main: "text-danger", bg: "bg-danger/20", border: "border-danger", shadow: "shadow-danger/40" };
  };

  const colors = getColors();
  const label = score >= 80 ? "جاهز" : score >= 60 ? "حذر" : "مرهق";

  return (
    <div className="flex flex-col items-center gap-6 animate-entry">
      <div className={cn(
        "relative flex items-center justify-center rounded-full border-[1px] border-white/5 bg-secondary/30 transition-all duration-700",
        isLarge ? "w-64 h-64" : "w-32 h-32"
      )}>
        {/* Outer Ring */}
        <div className={cn(
          "absolute inset-4 rounded-full border-[6px] border-secondary/50",
          colors.border
        )} style={{ 
          clipPath: `polygon(50% 50%, -50% -50%, ${score}% -50%, ${score}% 150%, -50% 150%)`,
          transform: 'rotate(-90deg)'
        }} />

        {/* Inner Content */}
        <div className={cn(
          "relative flex flex-col items-center justify-center rounded-full bg-card shadow-2xl border border-white/10",
          isLarge ? "w-48 h-48" : "w-24 h-24"
        )}>
          <span className={cn(
            "font-black tracking-tighter leading-none transition-colors duration-500",
            colors.main,
            isLarge ? "text-6xl" : "text-3xl"
          )}>
            {score.toFixed(1)}
          </span>
          <span className="text-[10px] font-bold opacity-40 uppercase tracking-[0.2em] mt-1">Readiness</span>
        </div>

        {/* Ambient Glow */}
        <div className={cn(
          "absolute -inset-2 rounded-full opacity-20 blur-2xl animate-pulse transition-colors duration-1000",
          colors.bg
        )} />
      </div>

      <div className={cn(
        "px-8 py-2 rounded-full font-black text-xs uppercase tracking-widest border transition-all duration-500",
        colors.main,
        colors.border,
        colors.bg
      )}>
        {label}
      </div>
    </div>
  );
}
