"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import ReadinessChart from "@/components/ReadinessChart";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { History, Calendar, Filter, ChevronLeft, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function PlayerHistory() {
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data } = await supabase
        .from('scans')
        .select('*')
        .eq('player_id', userData.user.id)
        .order('created_at', { ascending: false });
      
      setScans(data || []);
      setLoading(false);
    }
    fetchHistory();
  }, []);

  const getStatusColor = (color: string) => {
    switch (color) {
      case 'green': return 'bg-primary';
      case 'yellow': return 'bg-warning';
      case 'red': return 'bg-danger';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-background pb-32 p-6 space-y-8 animate-in fade-in duration-700">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-black flex items-center gap-2">
          <History className="text-primary" />
          سجل الفحوصات
        </h1>
        <Button variant="outline" size="sm" className="bg-card border-border">
          <Filter className="ml-2 w-4 h-4" />
          تصفية
        </Button>
      </header>

      {/* Pattern Detection Banner */}
      <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl flex items-center gap-4">
        <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary">
          <AlertCircle />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-sm">اكتشاف نمط!</h4>
          <p className="text-xs text-secondary-foreground leading-relaxed">
            لقد لاحظنا أن جاهزيتك تنخفض عادة يوم الأحد. تأكد من جودة نومك يوم السبت.
          </p>
        </div>
      </div>

      <section className="space-y-4">
        <h3 className="font-bold">تطور الجاهزية</h3>
        <ReadinessChart />
      </section>

      <section className="space-y-4">
        <h3 className="font-bold">الفحوصات السابقة</h3>
        <div className="grid grid-cols-1 gap-3">
          {scans.length > 0 ? (
            scans.map((scan) => (
              <Link key={scan.id} href={`/player/results?id=${scan.id}`}>
                <Card className="bg-card border-border hover:bg-secondary/30 transition-colors shadow-lg">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-12 rounded-full ${getStatusColor(scan.status_color)}`} />
                      <div>
                        <p className="font-black text-lg">{scan.readiness_score.toFixed(1)}</p>
                        <p className="text-xs text-secondary-foreground uppercase tracking-wider">
                          {new Date(scan.created_at).toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-secondary-foreground">
                      <span className="text-xs font-bold">{scan.scan_type === 'pregame' ? 'قبل المباراة' : 'فحص عادي'}</span>
                      <ChevronLeft size={16} />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <div className="text-center py-12 text-secondary-foreground">
              <p>لا يوجد سجلات بعد. ابدأ بأول فحص لك!</p>
            </div>
          )}
        </div>
      </section>

      {/* Layout handles BottomNav */}
    </div>
  );
}
