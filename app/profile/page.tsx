"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Mail, Calendar, LogOut, Users, Trophy, ExternalLink, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) {
          router.push("/auth");
          return;
        }

        // Fetch public user data
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single();
        
        setUser(userData);

        if (userData?.role === 'coach') {
          // Fetch teams managed by coach
          const { data: coachTeams } = await supabase
            .from('teams')
            .select('*')
            .eq('coach_id', authUser.id);
          setTeams(coachTeams || []);
        } else {
          // Fetch teams joined by player
          const { data: memberships } = await supabase
            .from('team_members')
            .select('team_id, teams(*)')
            .eq('player_id', authUser.id);
          setTeams(memberships?.map(m => m.teams) || []);
        }
      } catch (err) {
        console.error("Profile error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-background pb-32 relative overflow-hidden">
      {/* Technical Background Grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

      <header className="p-8 pb-32 relative z-10 overflow-hidden">
        {/* Animated Orbs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full -z-10 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 blur-[80px] rounded-full -z-10" />

        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8 animate-entry">
          <div className="relative">
            <div className="w-32 h-32 bg-primary/20 rounded-[2.5rem] flex items-center justify-center text-primary shadow-2xl border border-primary/30 text-5xl font-black">
              {user?.name?.[0]}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-card border border-white/10 px-3 py-1 rounded-full flex items-center gap-1 shadow-2xl">
              <ShieldCheck size={12} className="text-primary" />
              <span className="text-[8px] font-black uppercase tracking-widest">Verified</span>
            </div>
          </div>
          
          <div className="text-center md:text-right flex-1 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest mb-2">
              {user?.role === 'coach' ? 'Elite Coach' : 'Performance Player'}
            </div>
            <h1 className="text-4xl font-black tracking-tighter glow-text">{user?.name}</h1>
            <p className="text-secondary-foreground font-bold opacity-60 flex items-center justify-center md:justify-start gap-2 text-sm">
              <Mail size={14} /> {user?.email}
            </p>
          </div>

          <Button onClick={handleLogout} variant="destructive" className="rounded-2xl h-12 px-6 font-black tracking-tighter gap-2">
            <LogOut size={18} />
            تسجيل الخروج
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 -mt-16 relative z-20 space-y-8 animate-entry" style={{ animationDelay: '0.1s' }}>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="glass-card border-white/5 rounded-3xl overflow-hidden group shadow-2xl">
            <CardContent className="p-8 flex items-center gap-6">
              <div className="w-14 h-14 bg-secondary/50 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <Calendar size={28} />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Account Active Since</p>
                <p className="text-xl font-black tracking-tighter">
                  {new Date(user?.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long' })}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/5 rounded-3xl overflow-hidden group shadow-2xl">
            <CardContent className="p-8 flex items-center gap-6">
              <div className="w-14 h-14 bg-secondary/50 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <Trophy size={28} />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Experience Tier</p>
                <p className="text-xl font-black tracking-tighter">Pro Performance AI</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Teams Section */}
        <div className="space-y-6">
           <div className="flex items-center justify-between px-2">
              <div>
                <h3 className="text-2xl font-black tracking-tighter">
                  {user?.role === 'coach' ? 'الفرق التي تديرها' : 'الفرق التي تنتمي إليها'}
                </h3>
                <p className="text-xs font-bold opacity-40 uppercase tracking-widest mt-1">Squad Management</p>
              </div>
              <div className="flex gap-2">
                <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/20">
                  {teams.length} Teams
                </span>
              </div>
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-12">
             {teams.length > 0 ? (
               teams.map((t, i) => (
                 <Card key={t.id} className="glass-card border-white/5 hover:bg-white/5 transition-all duration-500 rounded-[2.5rem] overflow-hidden group cursor-pointer animate-entry" style={{ animationDelay: `${0.2 + (i * 0.1)}s` }}>
                   <CardContent className="p-8 space-y-6">
                     <div className="flex justify-between items-start">
                       <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-2xl border border-primary/20">
                          <Users size={32} />
                       </div>
                       <div className="text-right">
                         <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-secondary px-2 py-0.5 rounded leading-none">{t.code}</span>
                       </div>
                     </div>
                     
                     <div className="space-y-1">
                       <h4 className="text-2xl font-black tracking-tighter group-hover:text-primary transition-colors">{t.name}</h4>
                       <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Team Performance Cluster</p>
                     </div>

                     <Button variant="ghost" className="w-full justify-between h-12 rounded-xl border border-white/5 hover:bg-white/5 group-hover:border-primary/20 transition-all p-4">
                       <span className="text-xs font-black uppercase tracking-widest">View Profile</span>
                       <ExternalLink size={14} className="opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                     </Button>
                   </CardContent>
                 </Card>
               ))
             ) : (
               <div className="col-span-full py-20 bg-secondary/20 rounded-[3rem] border-2 border-dashed border-white/5 text-center space-y-6">
                 <div className="w-20 h-20 bg-card rounded-3xl flex items-center justify-center mx-auto opacity-40">
                    <Users size={40} />
                 </div>
                 <p className="text-sm font-bold opacity-40 uppercase tracking-[0.2em]">No active squad associations found</p>
               </div>
             )}
           </div>
        </div>
      </main>
    </div>
  );
}
