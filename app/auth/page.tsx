"use client";

import { useState, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Users } from "lucide-react";

function AuthComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") || "player";
  
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState(initialRole);
  const [error, setError] = useState("");

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role }
      }
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      // The profile is now created automatically by the DB trigger
      router.push(role === "coach" ? "/coach/create-team" : "/player/join");
    }
    setLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      const { data: profile } = await supabase
        .from('users')
        .select('role, baseline_ready')
        .eq('id', data.user.id)
        .single();

      if (profile) {
        if (profile.role === "coach") {
          router.push("/coach/dashboard");
        } else {
          router.push(profile.baseline_ready ? "/player/dashboard" : "/player/join");
        }
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md bg-card border-border shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary">Athlete Eyes</CardTitle>
          <CardDescription>مرحباً بك في مستقبل تحليل الجاهزية الرياضية</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 bg-secondary/50">
              <TabsTrigger value="login">تسجيل دخول</TabsTrigger>
              <TabsTrigger value="register">إنشاء حساب</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input id="email" type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">كلمة المرور</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                {error && <p className="text-danger text-sm">{error}</p>}
                <Button type="submit" className="w-full btn-primary" disabled={loading}>
                  {loading ? "جاري الدخول..." : "دخول"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register" className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole("player")}
                  className={`flex flex-col items-center justify-center p-4 border rounded-lg transition-all ${role === "player" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}
                >
                  <User className={`mb-2 ${role === "player" ? "text-primary" : "text-secondary-foreground"}`} />
                  <span className="text-sm font-bold">أنا لاعب</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("coach")}
                  className={`flex flex-col items-center justify-center p-4 border rounded-lg transition-all ${role === "coach" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}
                >
                  <Users className={`mb-2 ${role === "coach" ? "text-primary" : "text-secondary-foreground"}`} />
                  <span className="text-sm font-bold">أنا مدرب</span>
                </button>
              </div>

              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reg-name">الاسم الثلاثي</Label>
                  <Input id="reg-name" placeholder="أحمد محمد علي" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-email">البريد الإلكتروني</Label>
                  <Input id="reg-email" type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password">كلمة المرور</Label>
                  <Input id="reg-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                {error && <p className="text-danger text-sm">{error}</p>}
                <Button type="submit" className="w-full btn-primary" disabled={loading}>
                  {loading ? "جاري الإنشاء..." : "إنشاء حساب"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">جاري التحميل...</div>}>
      <AuthComponent />
    </Suspense>
  );
}
