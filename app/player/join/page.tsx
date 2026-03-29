"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Users, AlertCircle, Globe, ChevronRight, Hash, Send } from "lucide-react";
import { cn } from "@/lib/utils";

export default function JoinTeamPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'code' | 'browse'>('code');
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [team, setTeam] = useState<any>(null);
  const [allTeams, setAllTeams] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (activeTab === 'browse') {
      fetchAllTeams();
    }
  }, [activeTab]);

  const fetchAllTeams = async () => {
    setLoading(true);
    const { data, error: teamsError } = await supabase
      .from('teams')
      .select('id, name, code, users(name)')
      .order('name');
    
    if (teamsError) {
      setError("Failed to fetch team directory.");
    } else {
      setAllTeams(data || []);
    }
    setLoading(false);
  };

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

  const handleJoin = async (targetTeam: any) => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    setLoading(true);
    const { error: joinError } = await supabase
      .from('join_requests')
      .insert({
        player_id: userData.user.id,
        team_id: targetTeam.id,
        status: 'pending'
      });

    if (joinError) {
      if (joinError.code === '23505') {
        setError("لقد قمت بإرسال طلب بالفعل لهذا الفريق.");
      } else {
        setError(joinError.message);
      }
    } else {
      router.push("/player/pending");
    }
    setLoading(false);
  };

  const filteredTeams = allTeams.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.users?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pb-32 flex flex-col items-center relative overflow-hidden">
      {/* Technical Background Grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
      
      <header className="w-full p-8 border-b border-white/5 bg-card/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
             <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-xl">
               <ChevronRight />
             </Button>
             <h1 className="text-2xl font-black tracking-tighter glow-text">البحث عن فريق</h1>
          </div>
          <div className="flex bg-secondary/50 p-1 rounded-2xl border border-white/5 overflow-hidden">
            <Button 
                onClick={() => setActiveTab('code')}
                className={cn(
                  "h-8 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  activeTab === 'code' ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-transparent hover:bg-white/5"
                )}
            >
              <Hash size={12} className="ml-1.5" /> Direct Code
            </Button>
            <Button 
                onClick={() => setActiveTab('browse')}
                className={cn(
                  "h-8 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  activeTab === 'browse' ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-transparent hover:bg-white/5"
                )}
            >
              <Globe size={12} className="ml-1.5" /> Browse Menu
            </Button>
          </div>
        </div>
      </header>

      <main className="w-full max-w-xl p-6 mt-8 space-y-8 relative z-10 animate-entry">
        {activeTab === 'code' ? (
          <Card className="glass-card border-white/5 shadow-2xl rounded-[3rem] overflow-hidden">
            <CardHeader className="text-center pt-10 pb-6">
              <CardTitle className="text-3xl font-black tracking-tighter glow-text">انضمام سريع</CardTitle>
              <CardDescription className="text-[10px] font-bold uppercase tracking-widest opacity-40 mt-2">Enter your 5-digit squad ID</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 p-10 pt-4">
              <div className="space-y-4">
                <div className="relative group">
                  <Input
                    placeholder="12345"
                    maxLength={5}
                    className="h-20 text-center text-5xl font-black tracking-[0.4em] bg-secondary/50 border-white/5 rounded-[2rem] focus:ring-primary focus:border-primary transition-all pr-12"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  />
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:opacity-100 transition-opacity">
                    <Hash size={32} />
                  </div>
                </div>
                <Button onClick={handleSearch} disabled={loading} className="w-full h-16 btn-primary rounded-[1.5rem] text-xl font-black tracking-tighter shadow-2xl">
                  {loading ? "جاري البحث..." : "ابحث عن فريقك"}
                  <Search className="mr-3 w-5 h-5" />
                </Button>
              </div>

              {error && (
                <div className="p-4 bg-danger/10 border border-danger/20 rounded-2xl flex items-center gap-3 text-danger animate-shake">
                  <AlertCircle size={20} />
                  <p className="text-xs font-bold leading-tight">{error}</p>
                </div>
              )}

              {team && (
                <div className="bg-primary/5 p-8 rounded-[2.5rem] border border-primary/20 space-y-6 animate-in zoom-in-95 duration-500">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center text-primary shadow-2xl border border-primary/30">
                      <Users size={32} />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-2xl tracking-tighter leading-none">{team.name}</h3>
                      <p className="text-[10px] font-bold text-secondary-foreground uppercase tracking-widest mt-2">المدرب: {team.users?.name}</p>
                    </div>
                  </div>
                  <Button onClick={() => handleJoin(team)} className="w-full h-14 bg-white text-black hover:bg-white/90 rounded-2xl text-lg font-black tracking-tighter flex gap-3 shadow-2xl group" disabled={loading}>
                    <Send size={18} className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-all" />
                    إرسال طلب الانضمام
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6 animate-in duration-500 fade-in">
            <div className="relative group">
               <Input 
                  placeholder="ابحث عن اسم الفريق أو المدرب..." 
                  className="h-14 bg-secondary/50 border-white/5 rounded-2xl px-12 text-sm font-bold"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
               />
               <Search className="absolute right-4 top-1/2 -translate-y-1/2 opacity-40 group-focus-within:text-primary group-focus-within:opacity-100 transition-all" size={20} />
            </div>

            <div className="grid grid-cols-1 gap-4">
              {filteredTeams.length > 0 ? (
                filteredTeams.map((t, i) => (
                  <Card key={t.id} className="glass-card border-white/5 hover:bg-white/5 transition-all duration-500 rounded-3xl overflow-hidden group">
                    <CardContent className="p-6 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                           <Users size={24} />
                        </div>
                        <div>
                          <h4 className="font-black tracking-tighter text-lg">{t.name}</h4>
                          <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">By Coach {t.users?.name}</p>
                        </div>
                      </div>
                      <Button onClick={() => handleJoin(t)} variant="outline" size="sm" className="rounded-xl border-white/10 hover:bg-primary hover:text-white h-10 px-6 font-black tracking-tighter">
                        Join
                      </Button>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-20 opacity-40 flex flex-col items-center gap-4">
                   <Globe size={48} />
                   <p className="text-xs font-black uppercase tracking-widest">No public squads found</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
