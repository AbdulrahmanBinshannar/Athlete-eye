"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PendingApproval() {
  const router = useRouter();
  const [status, setStatus] = useState<'pending' | 'accepted' | 'rejected'>('pending');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkStatus() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data, error } = await supabase
        .from('join_requests')
        .select('status')
        .eq('player_id', userData.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data) {
        setStatus(data.status as any);
        if (data.status === 'accepted') {
          router.push("/player/calibration");
        }
      }
      setLoading(false);
    }

    checkStatus();

    // Real-time subscription
    const channel = supabase
      .channel('join_requests_status')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'join_requests',
      }, (payload) => {
        if (payload.new.status === 'accepted') {
          router.push("/player/calibration");
        } else if (payload.new.status === 'rejected') {
          setStatus('rejected');
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 text-center">
      <Card className="w-full max-w-md bg-card border-border shadow-2xl">
        <CardHeader>
          <div className="flex justify-center mb-4">
            {status === 'pending' && <Clock className="w-16 h-16 text-warning animate-pulse" />}
            {status === 'rejected' && <XCircle className="w-16 h-16 text-danger" />}
          </div>
          <CardTitle className="text-2xl font-bold">
            {status === 'pending' ? "طلبك بانتظار الموافقة" : "تم رفض الطلب"}
          </CardTitle>
          <CardDescription>
            {status === 'pending' 
              ? "سيتم إعلامك فور قبول المدرب لانضمامك للفريق" 
              : "للأسف تم رفض طلب انضمامك. يرجى التواصل مع المدرب أو تجربة كود آخر."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === 'rejected' && (
            <Button onClick={() => router.push("/player/join")} className="w-full btn-primary">
              تجربة كود آخر
            </Button>
          )}
          {status === 'pending' && (
            <div className="flex items-center justify-center gap-2 text-warning">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>جاري الانتظار...</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
