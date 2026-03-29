"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Camera, History } from "lucide-react";
import { cn } from "@/lib/utils";

const PLAYER_NAV_ITEMS = [
  { href: "/player/dashboard", label: "الرئيسية", icon: LayoutDashboard },
  { href: "/player/scan", label: "فحص", icon: Camera },
  { href: "/player/history", label: "السجل", icon: History },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-xl border-t border-border flex justify-around p-4 z-50 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
      {PLAYER_NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link 
            key={item.href} 
            href={item.href} 
            className={cn(
              "flex flex-col items-center gap-1 transition-all duration-300 relative",
              isActive ? "text-primary scale-110" : "text-secondary-foreground hover:text-primary tracking-tight"
            )}
          >
            <item.icon size={24} className={isActive ? "fill-primary/20" : ""} />
            <span className="text-[10px] font-black">{item.label}</span>
            {isActive && <div className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full shadow-[0_0_10px_rgba(15,110,86,0.8)]" />}
          </Link>
        );
      })}
    </nav>
  );
}
