import Link from "next/link";
import { Activity, Camera, TrendingUp, Users, ShieldCheck, Zap, ArrowRight, Brain, Target, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
      {/* Technical Background Grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

      {/* Header */}
      <header className="p-6 flex justify-between items-center bg-card/40 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-black shadow-lg shadow-primary/20">A</div>
          <h1 className="text-xl font-black tracking-tighter text-primary">Athlete Eyes</h1>
        </div>
        <div className="flex gap-4">
          <Link href="/auth?role=login">
            <Button variant="ghost" className="text-xs font-black uppercase tracking-widest hover:bg-white/5">تسجيل الدخول</Button>
          </Link>
          <Link href="/auth?role=signup">
            <Button className="btn-primary text-xs px-6">اشترك الآن</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 px-6 flex flex-col items-center text-center animate-entry">
        <div className="max-w-4xl space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-4">
            <Globe size={12} className="animate-spin-slow" />
            Next-Gen Biometric Intelligence
          </div>
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-none glow-text">
            حوّل كاميرا جوالك إلى <br />
            <span className="text-primary">مختبر أداء رياضي</span>
          </h2>
          <p className="text-secondary-foreground text-xl max-w-2xl mx-auto opacity-70 leading-relaxed">
            نحن نستخدم الذكاء الاصطناعي لتحليل تعابير عينيك وجهك، مما يمنحنا رؤية دقيقة لجاهزيتك البدنية والعصبية قبل كل تمرين.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
            <Link href="/auth?role=player" className="group">
              <Button className="w-full sm:w-64 h-20 btn-primary text-2xl font-black rounded-3xl shadow-[0_20px_50px_rgba(15,110,86,0.3)]">
                أنا لاعب <ArrowRight className="mr-4 group-hover:translate-x-2 transition-transform" />
              </Button>
            </Link>
            <Link href="/auth?role=coach">
              <Button variant="secondary" className="w-full sm:w-64 h-20 text-2xl font-black rounded-3xl bg-card border border-white/5 hover:bg-white/10 shadow-2xl">
                أنا مدرب
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* The Science / Concept */}
      <section className="py-32 px-6 relative z-10 bg-secondary/20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
          <div className="space-y-6">
            <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center text-primary shadow-2xl border border-primary/30 mb-8">
              <Brain size={32} />
            </div>
            <h3 className="text-4xl font-black tracking-tighter">علم الرؤية الحاسوبية في خدمتك</h3>
            <p className="text-secondary-foreground text-lg leading-relaxed opacity-80">
              يقوم نظام "Athlete Eyes" باستخراج بيانات ميكروية من تدفق الفيديو، بما في ذلك نبض القلب (Remote PPG)، تقلب ضربات القلب (HRV)، ومعدل الرمش. هذه البيانات تعطينا صورة كاملة عن استجابة جهازك العصبي للجهد والتوتر.
            </p>
            <div className="grid grid-cols-2 gap-6 pt-6 text-sm font-bold opacity-60">
              <div className="flex items-center gap-2">
                <ShieldCheck className="text-primary w-4 h-4" />
                تحليل دقيق بنسبة 98%
              </div>
              <div className="flex items-center gap-2">
                <Zap className="text-primary w-4 h-4" />
                توصيات فورية
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-4 pt-12">
               <div className="glass-card p-6 rounded-3xl border-white/5 shadow-2xl">
                 <Target className="text-primary mb-4" />
                 <h5 className="font-black text-xs uppercase tracking-widest mb-2">Focus Analysis</h5>
                 <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                   <div className="h-full bg-primary w-[85%] animate-pulse" />
                 </div>
               </div>
               <div className="glass-card p-6 rounded-3xl border-white/5 shadow-2xl">
                 <Activity className="text-orange-500 mb-4" />
                 <h5 className="font-black text-xs uppercase tracking-widest mb-2">Pulse Rate</h5>
                 <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                   <div className="h-full bg-orange-500 w-[62%] animate-pulse" />
                 </div>
               </div>
             </div>
             <div className="space-y-4">
               <div className="glass-card p-6 rounded-3xl border-white/5 shadow-2xl">
                 <TrendingUp className="text-blue-500 mb-4" />
                 <h5 className="font-black text-xs uppercase tracking-widest mb-2">HRV Score</h5>
                 <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                   <div className="h-full bg-blue-500 w-[74%] animate-pulse" />
                 </div>
               </div>
               <div className="glass-card p-6 rounded-3xl border-white/5 shadow-2xl scale-110 -translate-x-4">
                 <div className="flex items-center gap-2 mb-4">
                   <div className="w-3 h-3 bg-primary rounded-full animate-ping" />
                   <h5 className="font-black text-xs uppercase tracking-widest">Live Scan</h5>
                 </div>
                 <p className="text-[10px] font-bold opacity-40 leading-relaxed uppercase tracking-[0.2em]">Analyzing facial biometrics in real-time...</p>
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* Role Selection Detailed */}
      <section className="py-32 px-6">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h3 className="text-4xl font-black tracking-tighter">بوابتك للتميز الرياضي</h3>
            <p className="text-secondary-foreground font-bold uppercase tracking-widest text-xs opacity-60">Choose your performance path</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Player Card */}
            <Card className="glass-card border-primary/20 bg-primary/5 rounded-[3rem] overflow-hidden group hover:scale-[1.02] transition-all duration-700">
               <CardContent className="p-12 space-y-8">
                 <div className="w-20 h-20 bg-primary/20 rounded-3xl flex items-center justify-center text-primary shadow-2xl border border-primary/30">
                   <Zap size={40} />
                 </div>
                 <div className="space-y-4">
                   <h4 className="text-4xl font-black tracking-tighter">لاعب</h4>
                   <p className="text-secondary-foreground text-lg leading-relaxed opacity-80">
                     تحكم في أدائك اليومي، تتبع سجل جاهزيتك، وتلقى تنبيهات مبكرة لتجنب الإصابات الناتجة عن الإجهاد المفرط.
                   </p>
                 </div>
                 <Link href="/auth?role=player" className="block">
                   <Button className="w-full h-14 btn-primary rounded-2xl text-lg font-black tracking-tighter">
                     ابدأ رحلة التميز
                   </Button>
                 </Link>
               </CardContent>
            </Card>

            {/* Coach Card */}
            <Card className="glass-card border-white/5 rounded-[3rem] overflow-hidden group hover:scale-[1.02] transition-all duration-700">
               <CardContent className="p-12 space-y-8">
                 <div className="w-20 h-20 bg-secondary/50 rounded-3xl flex items-center justify-center text-foreground shadow-2xl border border-white/5">
                   <Users size={40} />
                 </div>
                 <div className="space-y-4">
                   <h4 className="text-4xl font-black tracking-tighter">مدرب</h4>
                   <p className="text-secondary-foreground text-lg leading-relaxed opacity-80">
                     راقب كامل الفريق من لوحة تحكم واحدة. اتخذ قرارات مبنية على بيانات علمية حول من يحتاج للراحة ومن هو مستعد للمنافسة.
                   </p>
                 </div>
                 <Link href="/auth?role=coach" className="block">
                   <Button variant="secondary" className="w-full h-14 bg-white text-black hover:bg-white/90 rounded-2xl text-lg font-black tracking-tighter">
                     إدارة فريقك بذكاء
                   </Button>
                 </Link>
               </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="p-12 text-center border-t border-white/5 bg-card/20 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center text-white text-[10px] font-black">A</div>
            <h1 className="text-lg font-black tracking-tighter text-primary">Athlete Eyes</h1>
          </div>
          <p className="text-xs text-secondary-foreground font-bold uppercase tracking-widest opacity-40">
            © {new Date().getFullYear()} Athlete Eyes | Pro Performance Analytics
          </p>
          <div className="flex gap-6 text-sm font-bold opacity-60">
            <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-primary transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
