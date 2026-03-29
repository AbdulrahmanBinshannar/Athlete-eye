"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UserCheck, AlertCircle, TrendingDown, ClipboardList, Copy, QrCode, Search, Filter, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function CoachDashboard() {
  const router = useRouter();
  const [team, setTeam] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) {
          router.push("/auth");
          return;
        }

        // 1. Fetch team
        const { data: teamData } = await supabase
          .from('teams')
          .select('*')
          .eq('coach_id', userData.user.id)
          .single();
        
        setTeam(teamData);

        if (teamData) {
          // 2. Fetch pending requests
          const { count } = await supabase
            .from('join_requests')
            .select('*', { count: 'exact', head: true })
            .eq('team_id', teamData.id)
            .eq('status', 'pending');
          
          setPendingCount(count || 0);

          // 3. Fetch players and their latest scans
          const { data: members, error: membersError } = await supabase
            .from('team_members')
            .select(`
              player_id,
              users (id, name, avatar_url)
            `)
            .eq('team_id', teamData.id);
          
          if (membersError) throw membersError;

          if (members && members.length > 0) {
            const playerIds = members.map(m => m.player_id);
            
            // Get latest scan for each player
            const { data: latestScans } = await supabase
              .from('scans')
              .select('*')
              .in('player_id', playerIds)
              .order('created_at', { ascending: false });

            const playerList = members.map((m: any) => {
              // Find the first (latest) scan for this player
              const playerScan = latestScans?.find(s => s.player_id === m.player_id);
              return {
                ...m.users,
                last_scan: playerScan || { readiness_score: 0, status_color: 'gray' }
              };
            });
            
            setPlayers(playerList.sort((a, b) => a.last_scan.readiness_score - b.last_scan.readiness_score));
          }
        } else {
          // No team found - redirect to creation
          router.push("/coach/create-team");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();

    // Subscribe to red alerts
    const subscription = supabase
      .channel('red-alerts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'scans', filter: "status_color=eq.red" }, (payload) => {
        // Show alert notification
        console.log("RED ALERT!", payload.new);
      })
      .subscribe();

    return () => { supabase.removeChannel(subscription); };
  }, []);

  const stats = {
    total: players.length,
    green: players.filter(p => p.last_scan.status_color === 'green').length,
    yellow: players.filter(p => p.last_scan.status_color === 'yellow').length,
    red: players.filter(p => p.last_scan.status_color === 'red').length,
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-background pb-20 relative overflow-hidden">
      {/* Technical Background Grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
      
      {/* Coach Header */}
      <header className="p-6 bg-card/40 backdrop-blur-xl border-b border-white/5 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="animate-entry">
            <h1 className="text-3xl font-black text-primary tracking-tighter glow-text">{team?.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-bold text-secondary-foreground font-mono uppercase tracking-[0.3em] bg-secondary px-2 py-0.5 rounded leading-none">{team?.code}</span>
              <Button variant="ghost" size="icon" className="h-4 w-4 opacity-40 hover:opacity-100">
                <Copy size={10} />
              </Button>
            </div>
          </div>
          <div className="flex gap-4">
            <Link href="/coach/requests">
              <Button className="relative btn-primary px-6">
                <Users className="ml-2 w-4 h-4" />
                طلبات الانضمام
                {pendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-danger text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center border border-card animate-bounce">
                    {pendingCount}
                  </span>
                )}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-6xl mx-auto space-y-10 relative z-10">
        {/* Summary Stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-entry" style={{ animationDelay: '0.1s' }}>
          {[
            { label: "إجمالي اللاعبين", val: stats.total, color: "text-foreground", border: "border-white/5" },
            { label: "جاهزية تامة", val: stats.green, color: "text-primary", border: "border-primary/20 bg-primary/5" },
            { label: "حذر", val: stats.yellow, color: "text-warning", border: "border-warning/20 bg-warning/5" },
            { label: "تحذير إصابة", val: stats.red, color: "text-danger", border: "border-danger/20 bg-danger/5" },
          ].map((s, i) => (
            <Card key={i} className={cn("bg-card/40 backdrop-blur-md border shadow-2xl transition-all duration-500 hover:scale-105", s.border)}>
              <CardContent className="p-6">
                <p className="text-[10px] font-bold text-secondary-foreground uppercase tracking-widest mb-1">{s.label}</p>
                <div className={cn("text-4xl font-black tracking-tighter", s.color)}>{s.val}</div>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* Red Alert Banner */}
        {stats.red > 0 && (
          <div className="bg-danger/10 border border-danger/20 p-6 rounded-3xl flex items-center gap-6 animate-pulse">
            <div className="w-12 h-12 bg-danger/20 rounded-2xl flex items-center justify-center text-danger">
              <AlertCircle size={32} />
            </div>
            <div className="flex-1">
              <h4 className="font-extrabold text-lg text-danger">تنبيه حرج!</h4>
              <p className="text-sm opacity-70">يوجد {stats.red} لاعبين في منطقة الخطر ويحتاجون إلى راحة فورية.</p>
            </div>
            <Button size="sm" className="bg-danger text-white rounded-xl px-6">تحليل</Button>
          </div>
        )}

        {/* Player List */}
        <section className="space-y-6 animate-entry" style={{ animationDelay: '0.2s' }}>
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-2xl font-black tracking-tighter">قائمة الفريق</h2>
              <p className="text-xs text-secondary-foreground font-bold uppercase tracking-widest mt-1">Player Readiness Monitoring</p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="icon" className="rounded-xl w-10 h-10 border border-white/5">
                <Search size={18} />
              </Button>
              <Button variant="secondary" size="icon" className="rounded-xl w-10 h-10 border border-white/5">
                <Filter size={18} />
              </Button>
            </div>
          </div>

            {players.length > 0 ? (
              players.map((player) => (
                <Link key={player.id} href={`/coach/player/${player.id}`}>
                  <Card className="glass-card border-white/5 hover:bg-white/5 transition-all duration-500 cursor-pointer group rounded-3xl overflow-hidden">
                    <CardContent className="p-6 flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center font-black text-2xl border border-primary/20 text-primary group-hover:scale-110 transition-transform shadow-2xl">
                          {player.name[0]}
                        </div>
                        <div>
                          <h4 className="text-xl font-black tracking-tighter">{player.name}</h4>
                          <p className="text-[10px] text-secondary-foreground font-bold uppercase tracking-widest opacity-60">
                            {player.last_scan.created_at 
                              ? `Last Sync: ${new Date(player.last_scan.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}`
                              : "No scan data available"}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-10">
                        <div className="text-center">
                          <p className="text-[10px] font-bold text-secondary-foreground uppercase tracking-[0.2em] mb-1">Status</p>
                          <p className={cn(
                            "text-3xl font-black tracking-tighter transition-colors duration-500",
                            player.last_scan.status_color === 'green' ? 'text-primary' : 
                            player.last_scan.status_color === 'yellow' ? 'text-warning' : 
                            player.last_scan.status_color === 'red' ? 'text-danger' : 'text-muted-foreground'
                          )}>
                            {player.last_scan.readiness_score ? (player.last_scan.readiness_score > 10 ? player.last_scan.readiness_score : player.last_scan.readiness_score * 10).toFixed(0) : "--"}
                          </p>
                        </div>
                        <div className={cn(
                          "w-5 h-5 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.3)] transition-all duration-500",
                          player.last_scan.status_color === 'green' ? 'bg-primary' : 
                          player.last_scan.status_color === 'yellow' ? 'bg-warning' : 
                          player.last_scan.status_color === 'red' ? 'bg-danger' : 'bg-muted/30'
                        )} />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="py-24 flex flex-col items-center justify-center text-center space-y-6 border-2 border-dashed border-white/5 rounded-[3rem] bg-secondary/10 backdrop-blur-sm">
                <div className="w-24 h-24 bg-secondary/50 rounded-3xl flex items-center justify-center text-secondary-foreground shadow-2xl">
                  <Users size={48} />
                </div>
                <div className="space-y-2">
                  <h3 className="font-black text-2xl tracking-tighter">قائمة الفريق فارغة</h3>
                  <p className="text-sm text-secondary-foreground font-bold opacity-60 max-w-xs mx-auto">
                    ابدأ بمشاركة كود الفريق مع لاعبيك للدخول في عصر التدريب الذكي.
                  </p>
                </div>
                <Button variant="outline" onClick={() => {
                  setPlayers([
                    { id: '1', name: 'أحمد محمود', last_scan: { readiness_score: 85.5, status_color: 'green', created_at: new Date().toISOString() } },
                    { id: '2', name: 'ياسين بونو', last_scan: { readiness_score: 72.1, status_color: 'yellow', created_at: new Date().toISOString() } },
                    { id: '3', name: 'سفيان أمرابط', last_scan: { readiness_score: 45.3, status_color: 'red', created_at: new Date().toISOString() } },
                  ]);
                }} className="mt-6 border-white/10 hover:bg-white/5 rounded-2xl px-8 h-12">
                  تفعيل العرض التجريبي (Demo)
                </Button>
              </div>
            )}
        </section>
      </main>
    </div>
  );
}
