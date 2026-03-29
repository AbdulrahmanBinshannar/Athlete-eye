"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { generateTeamCode } from "@/lib/team-code";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Copy, Check, Download, Share2, Users, Trophy, Sparkles } from "lucide-react";
import QRCode from "qrcode";
import { cn } from "@/lib/utils";

export default function CreateTeamPage() {
  const router = useRouter();
  const [teamName, setTeamName] = useState("");
  const [teamCode, setTeamCode] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    if (!teamName) return;
    setLoading(true);
    setError("");

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setError("يجب تسجيل الدخول كمدرب أولاً.");
        setLoading(false);
        return;
      }

      const code = generateTeamCode();
      
      // Generate QR Code
      const qrDataUrl = await QRCode.toDataURL(code);
      setQrUrl(qrDataUrl);

      const { data: team, error: insertError } = await supabase
        .from('teams')
        .insert({
          name: teamName,
          code: code,
          coach_id: userData.user.id,
          qr_code_url: qrDataUrl
        })
        .select()
        .single();

      if (insertError) {
        console.error(insertError);
        setError("حدث خطأ أثناء إنشاء الفريق: " + insertError.message);
      } else {
        setTeamCode(code);
      }
    } catch (err: any) {
      console.error(err);
      setError("حدث خطأ غير متوقع: " + err.message);
    }
    setLoading(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(teamCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Technical Background Grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
      
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/10 blur-[120px] -z-10" />

      <Card className="w-full max-w-md glass-card border-white/5 shadow-2xl rounded-[3rem] overflow-hidden animate-entry">
        <CardHeader className="text-center pt-12 pb-8">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary shadow-2xl border border-primary/20 mx-auto mb-6">
            <Users size={40} />
          </div>
          <CardTitle className="text-4xl font-black tracking-tighter glow-text">إنشاء فريق جديد</CardTitle>
          <CardDescription className="text-xs font-bold uppercase tracking-widest opacity-60 mt-2">Build your elite squad</CardDescription>
        </CardHeader>

        <CardContent className="space-y-8 px-10 pb-12">
          {!teamCode ? (
            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mr-1">Team Name</Label>
                <Input 
                  placeholder="مثال: نسور الأطلس" 
                  className="h-14 bg-secondary/50 border-white/5 rounded-2xl text-lg font-bold px-6 focus:ring-primary focus:border-primary"
                  value={teamName} 
                  onChange={(e) => {
                    setTeamName(e.target.value);
                    setError("");
                  }}
                />
              </div>
              {error && (
                <div className="p-4 bg-danger/10 border border-danger/20 rounded-2xl flex items-center gap-3 text-danger animate-shake">
                  <p className="text-xs font-bold">{error}</p>
                </div>
              )}
              <Button onClick={handleCreate} className="w-full h-14 btn-primary rounded-2xl text-lg font-black tracking-tighter shadow-2xl" disabled={loading || !teamName}>
                {loading ? "جاري الإنشاء..." : "ابدأ التأسيس"}
                <Trophy className="mr-3 w-5 h-5 text-warning" />
              </Button>
            </div>
          ) : (
            <div className="space-y-10 animate-in zoom-in-95 duration-500">
              <div className="text-center space-y-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-2">Unique Access Code</p>
                  <div className="flex items-center justify-center gap-4">
                    <span className="text-6xl font-black text-primary tracking-[0.2em] transition-all hover:scale-105">{teamCode}</span>
                  </div>
                </div>

                <Button onClick={copyToClipboard} variant="outline" className="w-[80%] mx-auto h-12 rounded-xl border-white/10 hover:bg-white/5 text-xs font-black uppercase tracking-widest gap-2">
                  {copied ? <Check className="text-primary w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "SUCCESSFULLY COPIED" : "COPY TEAM CODE"}
                </Button>
              </div>

              {qrUrl && (
                <div className="relative group bg-white p-8 rounded-[2.5rem] shadow-2xl transition-all hover:scale-[1.02]">
                  <img src={qrUrl} alt="Team QR Code" className="w-full aspect-square object-contain" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 backdrop-blur-sm transition-all flex items-center justify-center rounded-[2.5rem]">
                    <Button variant="outline" className="text-white border-white/20 rounded-2xl gap-2" onClick={() => {
                      const link = document.createElement('a');
                      link.download = `AE-TEAM-${teamCode}.png`;
                      link.href = qrUrl;
                      link.click();
                    }}>
                      <Download className="w-5 h-5" />
                      Save QR
                    </Button>
                  </div>
                </div>
              )}

              <Button onClick={() => router.push("/coach/dashboard")} className="w-full h-16 btn-primary rounded-3xl text-xl font-black tracking-tighter group">
                Go to Performance Dashboard
                <Sparkles className="mr-3 w-5 h-5 group-hover:rotate-12 transition-transform" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {!teamCode && (
        <Button variant="ghost" onClick={() => router.back()} className="mt-8 text-xs font-black uppercase tracking-[0.3em] opacity-40 hover:opacity-100">
          Back to Selection
        </Button>
      )}
    </div>
  );
}
