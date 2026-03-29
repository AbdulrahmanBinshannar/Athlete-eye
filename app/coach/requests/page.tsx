"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, User } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function JoinRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRequests() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data: team } = await supabase
        .from('teams')
        .select('id')
        .eq('coach_id', userData.user.id)
        .single();

      if (team) {
        const { data } = await supabase
          .from('join_requests')
          .select('*, users(name, email)')
          .eq('team_id', team.id)
          .eq('status', 'pending');
        
        setRequests(data || []);

        const { data: hist } = await supabase
          .from('join_requests')
          .select('*, users(name, email)')
          .eq('team_id', team.id)
          .neq('status', 'pending');
        
        setHistory(hist || []);
      }
      setLoading(false);
    }
    fetchRequests();

    // Subscribe to new requests
    const channel = supabase
      .channel('new-requests')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'join_requests' }, () => {
        fetchRequests();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleAction = async (requestId: string, playerId: string, teamId: string, status: 'accepted' | 'rejected') => {
    const { error } = await supabase
      .from('join_requests')
      .update({ status, responded_at: new Date().toISOString() })
      .eq('id', requestId);

    if (!error && status === 'accepted') {
      await supabase.from('team_members').insert({ team_id: teamId, player_id: playerId });
    }
    
    // Refresh lists
    setRequests(prev => prev.filter(r => r.id !== requestId));
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-8">
      <header>
        <h1 className="text-3xl font-black">طلبات الانضمام</h1>
        <p className="text-secondary-foreground mt-1">إدارة اللاعبين الراغبين في الانضمام لفريقك</p>
      </header>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-secondary/50">
          <TabsTrigger value="pending">طلبات حالية ({requests.length})</TabsTrigger>
          <TabsTrigger value="history">السجل</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4 pt-4">
          {requests.length > 0 ? (
            requests.map((req) => (
              <Card key={req.id} className="bg-card border-border shadow-lg">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                      <User />
                    </div>
                    <div>
                      <h4 className="font-bold">{req.users.name}</h4>
                      <p className="text-xs text-secondary-foreground">{req.users.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleAction(req.id, req.player_id, req.team_id, 'accepted')}
                      className="bg-primary hover:bg-primary/80 h-10 w-10 p-0 rounded-full"
                    >
                      <Check size={20} />
                    </Button>
                    <Button 
                      onClick={() => handleAction(req.id, req.player_id, req.team_id, 'rejected')}
                      className="bg-danger hover:bg-danger/80 h-10 w-10 p-0 rounded-full"
                    >
                      <X size={20} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-20 text-secondary-foreground">لا توجد طلبات معلقة حالياً.</div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4 pt-4">
          {history.map((req) => (
            <Card key={req.id} className="bg-card border-border/50 opacity-80">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h4 className="font-bold">{req.users.name}</h4>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${req.status === 'accepted' ? 'bg-primary/20 text-primary' : 'bg-danger/20 text-danger'}`}>
                    {req.status === 'accepted' ? 'تم القبول' : 'مرفوض'}
                  </span>
                </div>
                <p className="text-[10px] text-secondary-foreground">
                  {new Date(req.responded_at || req.created_at).toLocaleDateString('ar-EG')}
                </p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
