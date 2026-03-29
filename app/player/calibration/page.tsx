"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import CameraRecorder from "@/components/CameraRecorder";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Loader2, Sparkles } from "lucide-react";

export default function CalibrationPage() {
  const router = useRouter();
  const [scanCount, setScanCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [training, setTraining] = useState(false);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    async function getUser() {
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) setUserId(userData.user.id);
    }
    getUser();
  }, []);

  const handleRecordingComplete = async (blob: Blob) => {
    setLoading(true);
    
    // 1. Upload to Supabase Storage
    const fileName = `baseline/${userId}/${Date.now()}.webm`;
    const { error: uploadError } = await supabase.storage
      .from('scan-videos')
      .upload(fileName, blob);

    if (uploadError) {
      console.error(uploadError);
      setLoading(false);
      return;
    }

    // 2. Create scan record
    const { error: scanError } = await supabase
      .from('scans')
      .insert({
        player_id: userId,
        video_url: fileName,
        scan_type: 'baseline',
        baseline_index: scanCount + 1
      });

    if (scanError) {
      console.error(scanError);
    } else {
      const newCount = scanCount + 1;
      setScanCount(newCount);
      
      if (newCount === 5) {
        startTraining();
      }
    }
    setLoading(false);
  };

  const startTraining = async () => {
    setTraining(true);
    
    // Simulate training process (Python API would do this)
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Update user baseline_ready = true
    await supabase
      .from('users')
      .update({ baseline_ready: true })
      .eq('id', userId);

    // Create baseline record
    await supabase
      .from('baselines')
      .insert({ player_id: userId, scan_count: 5 });

    setTraining(false);
    router.push("/player/dashboard");
  };

  return (
    <div className="min-h-screen bg-background p-6 flex flex-col items-center justify-center max-w-2xl mx-auto">
      <Card className="w-full bg-card border-border shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-extrabold text-primary flex items-center justify-center gap-2">
            <Sparkles className="w-8 h-8" />
            بناء ملفك الصحي
          </CardTitle>
          <CardDescription className="text-lg">
            سجّل 5 فيديوهات قصيرة لبناء خط الأساس الخاص بك
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm font-bold">
              <span>التقدم: {scanCount}/5</span>
              <span>{Math.round((scanCount / 5) * 100)}%</span>
            </div>
            <Progress value={(scanCount / 5) * 100} className="h-3 bg-secondary/50" />
          </div>

          {!training ? (
            <div className="space-y-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-64 gap-4 animate-in fade-in">
                  <Loader2 className="w-16 h-16 text-primary animate-spin" />
                  <p className="font-bold">جاري رفع الفيديو وحفظ البيانات...</p>
                </div>
              ) : (
                <CameraRecorder onRecordingComplete={handleRecordingComplete} duration={10} />
              )}
              
              <div className="bg-secondary/20 p-4 rounded-xl border border-primary/10">
                <h4 className="font-bold flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  نصائح للمعايرة
                </h4>
                <ul className="text-sm text-secondary-foreground space-y-1 list-disc list-inside">
                  <li>اجلس في مكان هادئ بإضاءة جيدة.</li>
                  <li>ابقِ الكاميرا بمستوى عينك.</li>
                  <li>حاول أن تكون في حالة استرخاء تامة.</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 gap-6 animate-in zoom-in-95">
              <div className="relative">
                <Loader2 className="w-24 h-24 text-primary animate-spin" />
                <Sparkles className="absolute inset-0 m-auto w-10 h-10 text-primary animate-pulse" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-black">جاري تدريب الموديل...</h3>
                <p className="text-secondary-foreground">نقوم الآن بتحليل بصمتك الحيوية الفريدة.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
