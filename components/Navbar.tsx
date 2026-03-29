"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User, Bell, Menu, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname();

  useEffect(() => {
    async function fetchUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single();
        setUser(userData);
      }
    }
    fetchUser();
  }, []);

  // Hide nav on landing page for a cleaner look
  if (pathname === "/") return null;

  return (
    <nav className="sticky top-0 w-full z-50 bg-background/40 backdrop-blur-2xl border-b border-white/5 px-6 h-16 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-black shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">A</div>
          <h1 className="text-lg font-black tracking-tighter text-primary uppercase hidden md:block">Athlete Eyes</h1>
        </Link>
        
        <div className="hidden md:flex items-center gap-1 bg-secondary/50 p-1 rounded-xl border border-white/5">
          <div className="px-3 py-1 bg-primary/10 rounded-lg flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Live Bio-Feed</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-xs font-black tracking-tighter leading-none">{user.name}</span>
              <span className="text-[9px] font-bold text-primary uppercase tracking-widest mt-1 opacity-60">
                {user.role === 'coach' ? 'Pro Coach' : 'Elite Athlete'}
              </span>
            </div>
            
            <Link href="/profile">
              <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary shadow-2xl border border-primary/30 font-black text-lg hover:scale-105 transition-transform">
                {user.name?.[0]}
              </div>
            </Link>
          </div>
        ) : (
          <div className="flex gap-2">
            <Link href="/auth?role=login">
              <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest">Login</Button>
            </Link>
          </div>
        )}
        
        <div className="w-[1px] h-6 bg-white/5 mx-2 hidden sm:block" />
        
        <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl hover:bg-white/5 opacity-40">
           <Bell size={20} />
        </Button>
      </div>
    </nav>
  );
}
