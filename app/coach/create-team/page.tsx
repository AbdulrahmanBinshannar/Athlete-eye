"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { generateTeamCode } from "@/lib/team-code";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Copy, Check, Download, Share2 } from "lucide-react";
import QRCode from "qrcode";

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
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md bg-card border-border shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">إنشاء فريق جديد</CardTitle>
          <CardDescription>ابدأ ببناء فريقك الرياضي الذكي</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!teamCode ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>اسم الفريق</Label>
                <Input 
                  placeholder="مثال: نسور القرطاج" 
                  value={teamName} 
                  onChange={(e) => {
                    setTeamName(e.target.value);
                    setError("");
                  }}
                />
              </div>
              {error && <p className="text-danger text-sm font-bold bg-danger/10 p-2 rounded border border-danger/20">{error}</p>}
              <Button onClick={handleCreate} className="w-full btn-primary" disabled={loading || !teamName}>
                {loading ? "جاري الإنشاء..." : "إنشاء الفريق"}
              </Button>
            </div>
          ) : (
            <div className="space-y-6 animate-in zoom-in-95">
              <div className="text-center space-y-2">
                <p className="text-secondary-foreground">كود الفريق الخاص بك:</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-4xl font-black text-primary tracking-widest">{teamCode}</span>
                  <Button variant="ghost" size="icon" onClick={copyToClipboard}>
                    {copied ? <Check className="text-green-500" /> : <Copy className="w-5 h-5" />}
                  </Button>
                </div>
              </div>

              {qrUrl && (
                <div className="flex flex-col items-center gap-4 bg-white p-4 rounded-lg">
                  <img src={qrUrl} alt="Team QR Code" className="w-48 h-48" />
                  <Button variant="outline" className="text-black border-black/10" onClick={() => {
                    const link = document.createElement('a');
                    link.download = `team-qr-${teamCode}.png`;
                    link.href = qrUrl;
                    link.click();
                  }}>
                    <Download className="ml-2 w-4 h-4" />
                    تحميل QR Code
                  </Button>
                </div>
              )}

              <Button onClick={() => router.push("/coach/dashboard")} className="w-full btn-primary pt-6">
                الانتقال للوحة التحكم
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
