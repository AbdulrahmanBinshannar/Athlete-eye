"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import ReadinessChart from "@/components/ReadinessChart";
import TrafficLight from "@/components/TrafficLight";
import MetricsTable from "@/components/MetricsTable";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChevronRight, Save, MessageSquare, AlertTriangle, TrendingDown, Target, History, Trophy, Activity, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PlayerDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [player, setPlayer] = useState<any>(null);
  const [lastScan, setLastScan] = useState<any>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data: playerData } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
      
      setPlayer(playerData);

      const { data: scan } = await supabase
        .from('scans')
        .select('*')
        .eq('player_id', id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (scan && scan.readiness_score <= 10) {
        scan.readiness_score *= 10;
      }
      setLastScan(scan || { readiness_score: 0, status_color: 'gray' });

      const { data: coachNotes } = await supabase
        .from('coach_notes')
        .select('note')
        .eq('player_id', id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      setNotes(coachNotes?.note || "");
      setLoading(false);
    }
    fetchData();
  }, [id]);

  const saveNote = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    await supabase.from('coach_notes').insert({
      coach_id: userData.user.id,
      player_id: id as string,
      note: notes
    });
    alert("تم حفظ الملاحظة بنجاح");
  };

  if (loading || !player) return null;

  const demoMetrics = [
    { type: 'hr', label: 'نبض القلب', baseline: 62, today: 68, unit: 'BPM' },
    { type: 'hrv', label: 'HRV', baseline: 70, today: 64, unit: 'ms' },
    { type: 'blink', label: 'معدل الرمش', baseline: 17, today: 21, unit: '/د' },
  ];

  return (
    <div className="min-h-screen bg-background pb-20 relative overflow-hidden">
      {/* Technical Background Grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

      <header className="p-6 bg-card/40 backdrop-blur-xl border-b border-white/5 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex items-center gap-6 animate-entry">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-xl border border-white/5 hover:bg-white/5">
            <ChevronRight />
          </Button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center font-black text-2xl border border-primary/30 text-primary shadow-2xl">
              {player.name[0]}
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tighter glow-text">{player.name}</h1>
              <div className="flex items-center gap-4 mt-1 opacity-60">
                <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                  <Activity size={12} className="text-primary" />
                  Performance Profile
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                  <Trophy size={12} className="text-warning" />
                  First Team
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-6xl mx-auto space-y-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Column: Overall Status */}
          <div className="lg:col-span-1 space-y-10 animate-entry" style={{ animationDelay: '0.1s' }}>
            <Card className="glass-card border-white/5 rounded-[2.5rem] overflow-hidden">
              <CardHeader className="text-center pt-8">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-2">Current Readiness</p>
                <CardTitle className="text-2xl font-black tracking-tighter">حالة الجاهزية</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center pb-12">
                <TrafficLight score={lastScan.readiness_score} size="lg" />
              </CardContent>
            </Card>

            <Card className="glass-card border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
              <CardHeader className="pb-4 pt-8 px-8">
                <CardTitle className="text-lg font-black tracking-tighter flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <MessageSquare size={18} />
                  </div>
                  ملاحظات المدرب
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 px-8 pb-8">
                <Textarea 
                  placeholder="أضف ملاحظات خاصة حول حالة اللاعب البدنية أو الذهنية..." 
                  className="bg-secondary/40 h-40 border-white/5 rounded-2xl focus:ring-primary focus:border-primary text-sm p-4"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
                <Button onClick={saveNote} className="w-full h-12 btn-primary rounded-xl text-sm font-black tracking-tighter">
                  <Save className="ml-2 w-4 h-4" />
                  تحديث الملاحظات
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Deep Dive */}
          <div className="lg:col-span-2 space-y-12 animate-entry" style={{ animationDelay: '0.2s' }}>
            <section className="space-y-6">
              <div className="flex justify-between items-end px-2">
                <div>
                  <h3 className="text-2xl font-black tracking-tighter flex items-center gap-3">
                    <TrendingDown className="text-primary" />
                    تحليل الجاهزية
                  </h3>
                  <p className="text-[10px] font-bold text-secondary-foreground uppercase tracking-widest mt-1 opacity-60">7-Day Readiness Lifecycle</p>
                </div>
              </div>
              <ReadinessChart />
            </section>

            <section className="space-y-6">
              <div className="flex justify-between items-end px-2">
                <div>
                  <h3 className="text-2xl font-black tracking-tighter flex items-center gap-3">
                    <Target className="text-primary" />
                    مقارنة المؤشرات
                  </h3>
                  <p className="text-[10px] font-bold text-secondary-foreground uppercase tracking-widest mt-1 opacity-60">Real-time Biometric Analysis</p>
                </div>
              </div>
              <MetricsTable metrics={demoMetrics} />
            </section>

            <section className="space-y-6">
              <div className="flex justify-between items-end px-2">
                <div>
                  <h3 className="text-2xl font-black tracking-tighter flex items-center gap-3">
                    <History className="text-primary" />
                    السجل التاريخي
                  </h3>
                  <p className="text-[10px] font-bold text-secondary-foreground uppercase tracking-widest mt-1 opacity-60">Recent Performance Scans</p>
                </div>
                <Button variant="ghost" className="text-xs font-black uppercase tracking-widest text-primary">View All</Button>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="glass-card p-5 rounded-2xl border-white/5 flex justify-between items-center group hover:bg-white/5 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-secondary rounded-xl text-secondary-foreground opacity-40">
                        <Calendar size={18} />
                      </div>
                      <div>
                        <span className="font-extrabold text-sm block tracking-tight">{new Date().toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' })}</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Morning Session</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <span className="bg-primary/10 text-primary px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-primary/20">Normal</span>
                      <span className="font-black text-2xl tracking-tighter text-primary">8{i}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
