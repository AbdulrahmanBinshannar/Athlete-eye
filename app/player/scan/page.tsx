"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import CameraRecorder from "@/components/CameraRecorder";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Zap, AlertCircle, ChevronRight, Activity, Brain, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const ANALYSIS_STEPS = [
  "Initializing spectral analysis...",
  "Extracting Remote PPG (Pulse)...",
  "Calculating HRV frequency bands...",
  "Analyzing blink rate & eye fatigue...",
  "Running neural readiness model...",
  "Finalizing performance report..."
];

export default function ScanPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [scanType, setScanType] = useState<'regular' | 'pregame'>('regular');
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setStepIndex((prev) => (prev < ANALYSIS_STEPS.length - 1 ? prev + 1 : prev));
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleRecordingComplete = async (blob: Blob) => {
    setLoading(true);
    setStepIndex(0);
    
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("User not authenticated");

      // 1. Upload video
      const fileName = `scans/${userData.user.id}/${Date.now()}.webm`;
      const { error: uploadError } = await supabase.storage
        .from('scan-videos')
        .upload(fileName, blob);

      if (uploadError) throw uploadError;

      // 2. Call Analyze API
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: JSON.stringify({ videoUrl: fileName, playerId: userData.user.id, scanType }),
        headers: { 'Content-Type': 'application/json' }
      });
      const result = await response.json();
      
      // 3. Save results to Supabase (Normalize score to 0-100 if it's 0-10)
      const finalScore = result.score <= 10 ? result.score * 10 : result.score;
      
      const { data: scan, error: insertError } = await supabase
        .from('scans')
        .insert({
          player_id: userData.user.id,
          video_url: fileName,
          readiness_score: finalScore,
          status_color: result.color,
          confidence_score: result.confidence,
          scan_type: scanType
        })
        .select()
        .single();

      if (insertError) throw insertError;

      if (scan) {
        await supabase.from('scan_metrics').insert(
          result.metrics.map((m: any) => ({ ...m, scan_id: scan.id }))
        );
        router.push(`/player/results?id=${scan.id}`);
      }
    } catch (err) {
      console.error("Analysis failed:", err);
      alert("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 relative overflow-hidden">
      {/* Technical Background Grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

      <header className="p-6 bg-card/40 backdrop-blur-xl border-b border-white/5 sticky top-0 z-40">
        <div className="max-w-xl mx-auto flex items-center gap-4 animate-entry">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-xl">
            <ChevronRight />
          </Button>
          <div>
            <h1 className="text-2xl font-black tracking-tighter glow-text">جلسة فحص جديدة</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">High-Precision Bio-Analysis</p>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-xl mx-auto relative z-10 space-y-8 animate-entry">
        {!loading && (
          <div className="flex gap-4 p-2 glass-card rounded-2xl border-white/5 shadow-2xl">
            <Button 
              onClick={() => setScanType('regular')}
              className={cn(
                "flex-1 h-12 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                scanType === 'regular' ? 'btn-primary shadow-lg shadow-primary/20' : 'bg-transparent hover:bg-white/5'
              )}
            >
              <Activity className="ml-2 w-4 h-4" />
              Regular Scan
            </Button>
            <Button 
              onClick={() => setScanType('pregame')}
              className={cn(
                "flex-1 h-12 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                scanType === 'pregame' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-transparent hover:bg-white/5'
              )}
            >
              <Zap className="ml-2 w-4 h-4" />
              Pre-Game
            </Button>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center pt-20 pb-12 space-y-12 animate-in zoom-in-95 duration-500">
            <div className="relative">
              <div className="w-32 h-32 bg-primary/10 rounded-[2.5rem] flex items-center justify-center text-primary shadow-2xl border border-primary/20 animate-pulse">
                <Brain size={48} className="animate-bounce" />
              </div>
              <div className="absolute -inset-4 border border-primary/20 rounded-[3rem] animate-ping opacity-20" />
            </div>
            
            <div className="text-center space-y-4">
              <h3 className="text-3xl font-black tracking-tighter glow-text">
                {ANALYSIS_STEPS[stepIndex]}
              </h3>
              <div className="flex justify-center gap-1.5 pt-2">
                {ANALYSIS_STEPS.map((_, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "w-2 h-2 rounded-full transition-all duration-500",
                      i <= stepIndex ? "bg-primary scale-110 shadow-[0_0_10px_rgba(15,110,86,0.5)]" : "bg-white/10"
                    )} 
                  />
                ))}
              </div>
            </div>

            <div className="w-full max-w-xs glass-card p-6 rounded-3xl border-white/5 space-y-4 text-center">
              <div className="flex items-center justify-center gap-2 text-primary">
                <ShieldCheck size={16} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Validated Neural Model</span>
              </div>
              <p className="text-[10px] font-bold opacity-40 leading-relaxed uppercase tracking-widest">
                Our AI is extracting micro-fluctuations in blood flow and muscle micro-expressions to determine your neurological state.
              </p>
            </div>
          </div>
        ) : (
          <CameraRecorder onRecordingComplete={handleRecordingComplete} duration={20} />
        )}

        {!loading && (
          <div className="p-6 glass-card rounded-[2.5rem] border-white/5 border-dashed border-2 bg-transparent opacity-60">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/20 rounded-2xl text-primary">
                <AlertCircle size={24} />
              </div>
              <div>
                <h4 className="font-black text-sm tracking-tight mb-1">Optical Guidelines</h4>
                <p className="text-[10px] font-bold opacity-70 leading-relaxed">
                  Ensure even lighting across your face. Remove glasses if possible for more accurate HRV pupil extraction.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
