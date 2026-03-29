"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import CameraRecorder from "@/components/CameraRecorder";
import LightingCheck from "@/components/LightingCheck";
import { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Zap, AlertCircle } from "lucide-react";

export default function ScanPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loading, setLoading] = useState(false);
  const [scanType, setScanType] = useState<'regular' | 'pregame'>('regular');

  const handleRecordingComplete = async (blob: Blob) => {
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    // 1. Upload video
    const fileName = `scans/${userData.user.id}/${Date.now()}.webm`;
    const { error: uploadError } = await supabase.storage
      .from('scan-videos')
      .upload(fileName, blob);

    if (uploadError) {
      console.error(uploadError);
      setLoading(false);
      return;
    }

    // 2. Call Analyze API (Proxy to Python)
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: JSON.stringify({ videoUrl: fileName, playerId: userData.user.id, scanType }),
        headers: { 'Content-Type': 'application/json' }
      });
      const result = await response.json();
      
      // 3. Save results to Supabase
      const { data: scan, error: insertError } = await supabase
        .from('scans')
        .insert({
          player_id: userData.user.id,
          video_url: fileName,
          readiness_score: result.score,
          status_color: result.color,
          confidence_score: result.confidence,
          scan_type: scanType
        })
        .select()
        .single();

      if (scan) {
        // Save metrics
        await supabase.from('scan_metrics').insert(
          result.metrics.map((m: any) => ({ ...m, scan_id: scan.id }))
        );
        router.push(`/player/results?id=${scan.id}`);
      }
    } catch (err) {
      console.error(err);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <Card className="bg-card border-border shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-black">جلسة فحص جديدة</CardTitle>
          <CardDescription>ابقِ ثابتاً لمدة 20 ثانية للحصول على أدق النتائج</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-2 bg-secondary/30 p-2 rounded-xl border border-border">
            <Button 
              onClick={() => setScanType('regular')}
              className={`flex-1 rounded-lg ${scanType === 'regular' ? 'bg-primary' : 'bg-transparent text-foreground hover:bg-white/5'}`}
            >
              فحص عادي
            </Button>
            <Button 
              onClick={() => setScanType('pregame')}
              className={`flex-1 rounded-lg ${scanType === 'pregame' ? 'bg-primary' : 'bg-transparent text-foreground hover:bg-white/5'}`}
            >
              <Zap className="ml-2 w-4 h-4" />
              ما قبل المباراة
            </Button>
          </div>

          <div className="relative">
            {loading ? (
              <div className="aspect-[4/3] bg-card/80 border border-border rounded-2xl flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-16 h-16 text-primary animate-spin" />
                <h3 className="text-xl font-black">جاري تحليل البيانات...</h3>
                <p className="text-sm text-secondary-foreground text-center px-8">نحن نقوم بمعالجة الفيديو واستخراج القياسات الحيوية.</p>
              </div>
            ) : (
              <CameraRecorder onRecordingComplete={handleRecordingComplete} duration={20} />
            )}
            
            {/* We need access to the internal video stream for LightingCheck in real-time */}
            {/* For now, LightingCheck is integrated inside CameraRecorder or we can pass a proxy */}
          </div>

          <div className="flex items-center gap-2 text-primary bg-primary/10 p-4 rounded-xl border border-primary/20">
            <AlertCircle size={20} />
            <span className="text-sm">تأكد من عدم وجود إضاءة قوية خلفك.</span>
          </div>
        </CardContent>
      </Card>
      
      <Button variant="ghost" className="w-full text-secondary-foreground" onClick={() => router.back()}>
        إلغاء الفحص
      </Button>
    </div>
  );
}
