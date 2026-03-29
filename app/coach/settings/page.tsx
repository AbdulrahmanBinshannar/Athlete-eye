"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Trash2, RefreshCw, UserMinus, ShieldAlert, Save, ChevronRight, Share2 } from "lucide-react";
import { generateTeamCode } from "@/lib/team-code";

export default function TeamSettings() {
  const router = useRouter();
  const [team, setTeam] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data: teamData } = await supabase
        .from('teams')
        .select('*')
        .eq('coach_id', userData.user.id)
        .single();
      
      if (teamData) {
        setTeam(teamData);
        setNewName(teamData.name);
        
        const { data: memberData } = await supabase
          .from('team_members')
          .select('id, users(id, name, email)')
          .eq('team_id', teamData.id);
        
        setMembers(memberData || []);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const updateTeamName = async () => {
    await supabase.from('teams').update({ name: newName }).eq('id', team.id);
    alert("تم تحديث اسم الفريق");
  };

  const regenerateCode = async () => {
    if (!confirm("هل أنت متأكد؟ الكود القديم لن يعمل بعد الآن.")) return;
    const newCode = generateTeamCode();
    await supabase.from('teams').update({ code: newCode }).eq('id', team.id);
    setTeam({ ...team, code: newCode });
    alert("تم توليد كود جديد: " + newCode);
  };

  const removeMember = async (memberId: string) => {
    if (!confirm("هل تريد إزالة هذا اللاعب من الفريق؟")) return;
    await supabase.from('team_members').delete().eq('id', memberId);
    setMembers(prev => prev.filter(m => m.id !== memberId));
  };

  const deleteTeam = async () => {
    if (!confirm("تحذير: سيتم حذف الفريق وجميع البيانات بشكل نهائي. هل أنت متأكد؟")) return;
    await supabase.from('teams').delete().eq('id', team.id);
    router.push("/coach/create-team");
  };

  if (loading || !team) return null;

  return (
    <div className="min-h-screen bg-background p-6 space-y-8 pb-20">
      <header className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronRight />
        </Button>
        <h1 className="text-3xl font-black">إعدادات الفريق</h1>
      </header>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Basic Settings */}
        <Card className="bg-card border-border shadow-lg">
          <CardHeader>
            <CardTitle>المعلومات الأساسية</CardTitle>
            <CardDescription>تحديث اسم الفريق وإدارة كود الانضمام</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>اسم الفريق</Label>
              <div className="flex gap-2">
                <Input value={newName} onChange={(e) => setNewName(e.target.value)} />
                <Button onClick={updateTeamName} className="btn-primary">
                  <Save size={16} />
                </Button>
              </div>
            </div>
            
            <div className="pt-4 border-t border-border flex justify-between items-center">
              <div>
                <p className="font-bold">كود الانضمام: <span className="text-secondary-foreground font-mono">{team.code}</span></p>
                <p className="text-xs text-secondary-foreground">شارك هذا الكود مع اللاعبين الجدد.</p>
              </div>
              <Button variant="outline" size="sm" onClick={regenerateCode}>
                <RefreshCw size={14} className="ml-2" />
                تغيير الكود
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Member Management */}
        <Card className="bg-card border-border shadow-lg">
          <CardHeader>
            <CardTitle>إدارة اللاعبين ({members.length})</CardTitle>
            <CardDescription>قائمة بجميع أعضاء الفريق الحاليين</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {members.map((m) => (
              <div key={m.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg border border-border">
                <div>
                  <p className="font-bold text-sm tracking-tight">{m.users.name}</p>
                  <p className="text-[10px] text-secondary-foreground tracking-tight">{m.users.email}</p>
                </div>
                <Button variant="ghost" size="icon" className="text-danger hover:bg-danger/10" onClick={() => removeMember(m.id)}>
                  <UserMinus size={18} />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-danger/20 bg-danger/5 shadow-inner">
          <CardHeader>
            <CardTitle className="text-danger flex items-center gap-2">
              <ShieldAlert size={20} />
              منطقة الخطر
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-between items-center">
            <div className="space-y-1">
              <p className="font-bold text-sm text-danger">حذف الفريق نهائياً</p>
              <p className="text-xs opacity-60">سيتم مسح كود الفريق، القائمة، وجميع سجلات الفحص.</p>
            </div>
            <Button variant="outline" className="text-danger border-danger/30 hover:bg-danger hover:text-white" onClick={deleteTeam}>
              <Trash2 size={16} className="ml-2" />
              حذف الفريق
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
