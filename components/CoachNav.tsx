"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, UserPlus, Settings, LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/coach/dashboard", label: "الرئيسية", icon: LayoutDashboard },
  { href: "/coach/requests", label: "الطلبات", icon: UserPlus },
  { href: "/profile", label: "حسابي", icon: User },
  { href: "/coach/settings", label: "الإعدادات", icon: Settings },
];

export default function CoachNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-xl border-t border-border flex justify-around p-4 z-50 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link 
            key={item.href} 
            href={item.href} 
            className={cn(
              "flex flex-col items-center gap-1 transition-all duration-300",
              isActive ? "text-primary scale-110" : "text-secondary-foreground hover:text-primary"
            )}
          >
            <item.icon size={24} className={isActive ? "fill-primary/20" : ""} />
            <span className="text-[10px] font-black">{item.label}</span>
            {isActive && <div className="w-1 h-1 bg-primary rounded-full absolute -bottom-1" />}
          </Link>
        );
      })}
    </nav>
  );
}
