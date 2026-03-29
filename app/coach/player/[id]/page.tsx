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
import { ChevronRight, Save, MessageSquare, AlertTriangle, TrendingDown, Target, History } from "lucide-react";

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
    <div className="min-h-screen bg-background p-6 space-y-8">
      <header className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronRight />
        </Button>
        <div>
          <h1 className="text-3xl font-black">{player.name}</h1>
          <p className="text-secondary-foreground text-sm">التاريخ الصحي والجاهزية</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Overall Status */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-card border-border shadow-xl">
            <CardHeader className="text-center">
              <CardTitle>حالة الجاهزية الحالية</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center pb-8">
              <TrafficLight score={lastScan.readiness_score} size="lg" />
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="text-primary w-5 h-5" />
                ملاحظات المدرب
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea 
                placeholder="أضف ملاحظات خاصة حول حالة اللاعب البدنية أو الذهنية..." 
                className="bg-secondary/30 h-32 border-border focus:border-primary"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <Button onClick={saveNote} className="w-full btn-primary">
                <Save className="ml-2 w-4 h-4" />
                حفظ الملاحظة
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Deep Dive */}
        <div className="lg:col-span-2 space-y-8">
          <section className="space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <TrendingDown className="text-primary" />
              منحنى الجاهزية (آخر 7 أيام)
            </h3>
            <ReadinessChart />
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Target className="text-primary" />
              مقارنة المؤشرات الحيوية
            </h3>
            <MetricsTable metrics={demoMetrics} />
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <History className="text-primary" />
              آخر 5 فحوصات
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="bg-card p-4 rounded-lg border border-border flex justify-between items-center text-sm">
                  <span className="font-bold">{new Date().toLocaleDateString('ar-EG')}</span>
                  <div className="flex items-center gap-4">
                    <span className="bg-secondary px-2 py-0.5 rounded text-xs opacity-70">عادي</span>
                    <span className="font-black text-primary">8.{i}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
