"use client";

import { useEffect, useState, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { useSearchParams, useRouter } from "next/navigation";
import TrafficLight from "@/components/TrafficLight";
import MetricsTable from "@/components/MetricsTable";
import FeedbackButtons from "@/components/FeedbackButtons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, Zap, Wind, User, Droplets, Target, ShieldAlert } from "lucide-react";

function ResultsComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scanId = searchParams.get("id");
  const [scan, setScan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResults() {
      if (!scanId) return;
      const { data } = await supabase
        .from('scans')
        .select('*, scan_metrics(*)')
        .eq('id', scanId)
        .single();
      
      setScan(data);
      setLoading(false);
    }
    fetchResults();
  }, [scanId]);

  if (loading || !scan) return null;

  const metrics = [
    { type: 'hr', label: 'نبض القلب', baseline: 60, today: 65, unit: 'BPM' },
    { type: 'hrv', label: 'HRV', baseline: 75, today: 68, unit: 'ms' },
    { type: 'blink', label: 'معدل الرمش', baseline: 18, today: 22, unit: '/د' },
    { type: 'reaction', label: 'زمن الاستجابة', baseline: 210, today: 225, unit: 'ms' }
  ];

  return (
    <div className="min-h-screen bg-background pb-32 p-6 space-y-8 animate-in backdrop-blur-sm slide-in-from-bottom-10 duration-1000">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-black">نتائج الفحص</h1>
        <div className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm font-bold border border-primary/30">
          دقة التحليل: {(scan.confidence_score * 100).toFixed(0)}%
        </div>
      </header>

      <div className="flex flex-col items-center">
        <TrafficLight score={scan.readiness_score} />
        {scan.low_lighting && (
          <div className="mt-4 flex items-center gap-2 text-danger bg-danger/10 px-4 py-2 rounded-lg border border-danger/20 text-xs">
            <ShieldAlert size={14} />
            تحذير: دقة التنبؤ منخفضة بسبب الإضاءة الضعيفة.
          </div>
        )}
      </div>

      <MetricsTable metrics={metrics} />

      <section className="space-y-4">
        <h3 className="font-black text-xl flex items-center gap-3">
          <Zap className="text-primary" />
          توصيات مخصصة
        </h3>
        <div className="grid grid-cols-1 gap-4">
          <Card className="bg-card border-border shadow-lg border-r-4 border-r-primary">
            <CardHeader className="p-4 flex flex-row items-center gap-4">
              <div className="p-3 bg-secondary rounded-xl text-primary">
                <Wind size={24} />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-base font-black">جلسة تنفس عميق (3 د)</CardTitle>
                <p className="text-xs text-secondary-foreground leading-relaxed">
                  معدل الـ HRV منخفض قليلاً. سيساعدك التنفس ببطء على موازنة الجهاز العصبي.
                </p>
              </div>
            </CardHeader>
          </Card>
          
          <Card className="bg-card border-border shadow-lg border-r-4 border-r-blue-500">
            <CardHeader className="p-4 flex flex-row items-center gap-4">
              <div className="p-3 bg-secondary rounded-xl text-blue-500">
                <Droplets size={24} />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-base font-black">زيادة شرب السوائل</CardTitle>
                <p className="text-xs text-secondary-foreground leading-relaxed">
                  زيادة نبض القلب قد تكون مؤشراً لجفاف طفيف. اشرب 250 مل ماء الآن.
                </p>
              </div>
            </CardHeader>
          </Card>

          {scan.scan_type === 'pregame' && (
            <Card className="bg-primary text-white border-0 shadow-xl overflow-hidden relative">
              <CardHeader className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <CardTitle className="text-xl font-black">جاهزية المباراة 🔥</CardTitle>
                    <p className="text-sm opacity-90">أنت في منطقة التركيز العالي. حافظ على هدوئك وقم بتمارين الإحماء التدريجي لتقليل التوتر.</p>
                  </div>
                  <Target className="w-12 h-12 opacity-30" />
                </div>
              </CardHeader>
            </Card>
          )}
        </div>
      </section>

      <hr className="border-border/50" />

      <FeedbackButtons scanId={scan.id} playerId={scan.player_id} />

      <div className="flex gap-4">
        <Button onClick={() => router.push("/player/dashboard")} className="flex-1 bg-secondary text-foreground hover:bg-secondary/80">
          لوحة التحكم
        </Button>
        <Button onClick={() => router.push("/player/scan")} className="flex-1 btn-primary">
          فحص جديد
        </Button>
      </div>

      {/* Layout handles BottomNav */}
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">جاري التحميل...</div>}>
      <ResultsComponent />
    </Suspense>
  );
}
