"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Users, AlertCircle } from "lucide-react";

export default function JoinTeamPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [team, setTeam] = useState<any>(null);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (code.length !== 5 || !/^\d+$/.test(code)) {
      setError("تنسيق الكود غير صحيح (مكون من 5 أرقام)");
      return;
    }

    setLoading(true);
    setError("");
    setTeam(null);

    const { data, error: teamError } = await supabase
      .from('teams')
      .select('id, name, coach_id, users(name)')
      .eq('code', code)
      .single();

    if (teamError || !data) {
      setError("الفريق غير موجود. تأكد من الكود.");
    } else {
      setTeam(data);
    }
    setLoading(false);
  };

  const handleJoin = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    setLoading(true);
    const { error: joinError } = await supabase
      .from('join_requests')
      .insert({
        player_id: userData.user.id,
        team_id: team.id,
        status: 'pending'
      });

    if (joinError) {
      setError(joinError.message);
    } else {
      router.push("/player/pending");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background p-6 flex items-center justify-center relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/10 blur-[120px] -z-10" />
      
      <Card className="w-full max-w-md glass-card border-white/5 shadow-2xl rounded-[2.5rem] overflow-hidden animate-entry">
        <CardHeader className="text-center pt-10 pb-6">
          <CardTitle className="text-4xl font-black tracking-tighter glow-text">انضمام للفريق</CardTitle>
          <CardDescription className="text-xs font-bold uppercase tracking-widest opacity-60 mt-2">Enter your 5-digit performance code</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 p-10">
          <div className="space-y-4">
            <div className="relative group">
              <Input
                placeholder="12345"
                maxLength={5}
                type="text"
                className="h-16 text-center text-4xl font-black tracking-[0.5em] bg-secondary/50 border-white/5 rounded-2xl focus:ring-primary focus:border-primary transition-all pr-12"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:opacity-100 transition-opacity">
                <Users size={24} />
              </div>
            </div>
            <Button onClick={handleSearch} disabled={loading} className="w-full h-14 btn-primary rounded-2xl text-xl font-black tracking-tighter shadow-[0_10px_30px_rgba(15,110,86,0.2)]">
              {loading ? "جاري البحث..." : "ابحث عن فريقك"}
              <Search className="mr-3 w-5 h-5" />
            </Button>
          </div>

          {error && (
            <div className="p-4 bg-danger/10 border border-danger/20 rounded-2xl flex items-center gap-3 text-danger animate-shake">
              <AlertCircle size={20} />
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}

          {team && (
            <div className="bg-primary/5 p-8 rounded-3xl border border-primary/20 space-y-6 animate-in zoom-in-95 duration-500">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center text-primary shadow-2xl border border-primary/30">
                  <Users size={32} />
                </div>
                <div>
                  <h3 className="font-extrabold text-2xl tracking-tighter leading-none">{team.name}</h3>
                  <p className="text-xs font-bold text-secondary-foreground uppercase tracking-widest mt-2">المدرب: {team.users?.name}</p>
                </div>
              </div>
              <Button onClick={handleJoin} className="w-full h-14 bg-white text-black hover:bg-white/90 rounded-2xl text-lg font-black tracking-tighter shadow-2xl" disabled={loading}>
                إرسال طلب الانضمام
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
