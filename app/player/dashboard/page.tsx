"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import TrafficLight from "@/components/TrafficLight";
import ReadinessChart from "@/components/ReadinessChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flame, ArrowUp, ArrowDown, Bell, Camera } from "lucide-react";

export default function PlayerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [lastScan, setLastScan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.push("/auth");
        return;
      }

      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', userData.user.id)
        .single();

      // 2. Fetch team membership
      const { data: membership } = await supabase
        .from('team_members')
        .select(`
          team_id,
          teams (id, name, coach_id, users(name))
        `)
        .eq('player_id', userData.user.id)
        .single();
      
      setUser({ ...profile, team: membership?.teams });

      // 3. Fetch latest scan
      const { data: scan } = await supabase
        .from('scans')
        .select('*')
        .eq('player_id', userData.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (scan && scan.readiness_score <= 10) {
        scan.readiness_score *= 10; // Normalize to 0-100
      }

      setLastScan(scan || null);
      setLoading(false);
    }
    fetchData();
  }, [router]);

  if (loading) return null;

  return (
    <div className="min-h-screen bg-background pb-24 text-foreground relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-96 bg-primary/20 blur-[120px] -z-10 animate-pulse" />
      <div className="absolute top-40 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-[80px] -z-10" />

      {/* Top Header */}
      <header className="p-6 flex justify-between items-center bg-card/40 backdrop-blur-xl sticky top-0 z-40 border-b border-white/5">
        <div className="flex items-center gap-4 animate-entry">
          <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary font-black text-xl border border-primary/30 shadow-2xl">
            {user?.name?.[0]}
          </div>
          <div>
            <h1 className="text-[10px] font-bold opacity-40 uppercase tracking-[0.3em]">
              {user?.team ? user.team.name : "لاعب حر"}
            </h1>
            <h2 className="text-2xl font-black tracking-tighter glow-text">{user?.name}</h2>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="bg-secondary/80 backdrop-blur-md px-4 py-1.5 rounded-full flex items-center gap-2 border border-white/5 shadow-xl">
            <Flame className="text-orange-500 w-4 h-4" />
            <span className="font-black text-xs">5 أيام</span>
          </div>
        </div>
      </header>

      <main className="p-6 space-y-12 relative z-10">
        {/* Main Readiness Card */}
        <section className="flex flex-col items-center justify-center py-10 animate-entry">
          {lastScan ? (
            <>
              <TrafficLight score={lastScan.readiness_score} />
              <div className="mt-10 flex items-center gap-3 bg-primary/10 px-6 py-2.5 rounded-2xl text-primary border border-primary/20 shadow-2xl backdrop-blur-sm">
                <ArrowUp size={18} className="animate-bounce" />
                <span className="font-black text-sm tracking-tight">أداء استثنائي مقارنة بملفك المرجعي</span>
              </div>
            </>
          ) : (
            <div className="text-center space-y-6">
              <div className="w-48 h-48 mx-auto bg-card/40 rounded-full flex items-center justify-center border-4 border-dashed border-white/5 backdrop-blur-md">
                <Camera size={64} className="text-secondary-foreground opacity-20" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black tracking-tighter">لا توجد سجلات بعد</h3>
                <p className="text-sm text-secondary-foreground font-bold opacity-60">قم بإجراء فحصك الأول لتبدأ التحليل الذكي</p>
              </div>
              <Button onClick={() => {
                setLastScan({ readiness_score: 78.4, created_at: new Date().toISOString() });
              }} variant="link" className="text-primary text-xs font-black uppercase tracking-widest">
                تشغيل العرض التجريبي
              </Button>
            </div>
          )}
        </section>

        {/* Quick Actions */}
        <Button 
          onClick={() => router.push("/player/scan")} 
          className="w-full h-20 btn-primary text-2xl font-black rounded-3xl shadow-[0_20px_50px_rgba(15,110,86,0.4)] border border-white/10"
        >
          اكتشف جاهزيتك الآن
        </Button>

        {/* Readiness Trend */}
        <section className="space-y-6 animate-entry" style={{ animationDelay: '0.2s' }}>
          <div className="flex justify-between items-end">
            <div>
              <h3 className="font-black text-xl tracking-tighter">تحليل الأداء الأسبوعي</h3>
              <p className="text-[10px] text-secondary-foreground font-bold uppercase tracking-widest mt-1">7-Day Readiness Trend</p>
            </div>
          </div>
          <ReadinessChart />
        </section>

        {/* Recent Tips */}
        <section className="space-y-4">
          <h3 className="font-black text-lg">توصيات لك</h3>
          <div className="grid grid-cols-1 gap-4">
            <Card className="bg-card border-border shadow-lg">
              <CardHeader className="p-4 flex flex-row items-center gap-4">
                <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 font-bold text-xl">
                  💧
                </div>
                <div>
                  <CardTitle className="text-sm font-black">زيادة شرب الماء</CardTitle>
                  <p className="text-xs text-secondary-foreground">معدل نبضك يشير إلى حاجة ترطيب.</p>
                </div>
              </CardHeader>
            </Card>
            <Card className="bg-card border-border shadow-lg">
              <CardHeader className="p-4 flex flex-row items-center gap-4">
                <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 font-bold text-xl">
                  🧘
                </div>
                <div>
                  <CardTitle className="text-sm font-black">جلسة استرخاء (5 د)</CardTitle>
                  <p className="text-xs text-secondary-foreground">تعزيز الـ HRV عبر التنفس العميق.</p>
                </div>
              </CardHeader>
            </Card>
          </div>
        </section>
      </main>

      {/* Layout handles BottomNav */}
    </div>
  );
}
