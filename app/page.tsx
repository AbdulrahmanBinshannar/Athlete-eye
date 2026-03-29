"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Camera, Activity, ShieldCheck, Zap, ArrowRight, Brain, Heart, Eye, Target, Trophy, Sparkles, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Technical Background Grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
      
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/5 blur-[150px] -z-10" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full -z-10 animate-pulse" />

      {/* 🚀 Hero Section */}
      <section className="relative pt-32 pb-32 px-6 flex flex-col items-center text-center max-w-5xl mx-auto space-y-10 animate-entry">
        <div className="bg-primary/10 border border-primary/20 rounded-full px-6 py-2 flex items-center gap-3 shadow-2xl">
          <Sparkles size={16} className="text-primary animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary whitespace-nowrap">Biometric AI Analysis v2.0</span>
        </div>
        
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] glow-text translate-y-2">
          عيون الأداء<br/>
          <span className="text-primary">Athletic Intelligence</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-secondary-foreground font-bold max-w-2xl opacity-70 leading-relaxed font-arabic">
          حوّل كاميرا جوالك إلى نظام مختبر رياضي ذكي. حلل نبضك، توازنك العصبي، وتركيزك في ثوانٍ معدودة قبل الصعود للملعب.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 w-full max-w-md pt-8">
          <Link href="/auth?role=coach" className="flex-1">
            <Button className="w-full h-20 btn-primary rounded-[1.5rem] group text-xl font-black tracking-tighter shadow-2xl">
              أنا مدرب
              <ArrowRight className="mr-3 w-6 h-6 group-hover:translate-x-1 transition-all" />
            </Button>
          </Link>
          <Link href="/auth?role=player" className="flex-1">
            <Button variant="outline" className="w-full h-20 bg-secondary/20 hover:bg-secondary/40 border-white/5 rounded-[1.5rem] text-xl font-black tracking-tighter text-foreground group shadow-xl">
              أنا لاعب
              <Camera className="mr-3 w-6 h-6 group-hover:scale-110 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>

      {/* 🧬 Interactive Concept "The Idea" */}
      <section className="px-6 py-32 bg-secondary/20 relative z-10 border-y border-white/5">
        <div className="max-w-6xl mx-auto space-y-20">
          <div className="text-center space-y-4">
             <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-4">
              <Globe size={12} /> Visual Intelligence Technology
            </div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter bg-gradient-to-r from-white via-white/80 to-primary bg-clip-text text-transparent italic">
              ما هي فكرة "عـيون الأداء"؟
            </h2>
            <p className="text-lg text-secondary-foreground font-bold opacity-60 max-w-3xl mx-auto leading-relaxed">
              بدلاً من الأجهزة المعقدة والأسلاك، نستخدم خوارزميات الرؤية الحاسوبية لاستخراج المؤشرات الحيوية من "وجه الرياضي" مباشرة عبر الفيديو.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                icon: Heart, 
                title: "نبض القلب الرقمي", 
                desc: "تقنية rPPG ترصد تدفق الدم تحت الجلد من خلال تغييرات اللون الدقيقة التي لا تراها العين البشرية.",
                color: "text-primary",
                bg: "bg-primary/20"
              },
              { 
                icon: Brain, 
                title: "تحليل الإجهاد العصبي", 
                desc: "نحلل تقلب ضربات القلب (HRV) لتقييم مدى تعافي جهازك العصبي وجاهزيته للمجهود البدني الشاق.",
                color: "text-blue-500",
                bg: "bg-blue-500/20"
              },
              { 
                icon: Eye, 
                title: "مؤشر التركيز الذهني", 
                desc: "تتبع حركة العين ومعدل الرمش يخبرنا عن مستويات التعب الذهني والقدرة على اتخاذ القرار السريع في الملعب.",
                color: "text-warning",
                bg: "bg-warning/20"
              }
            ].map((feature, i) => (
              <Card key={i} className="glass-card border-white/5 bg-background/40 p-10 rounded-[3rem] hover:scale-105 transition-all duration-700 relative group overflow-hidden animate-entry" style={{ animationDelay: `${i * 0.2}s` }}>
                <div className={cn("inline-flex p-5 rounded-3xl mb-8 group-hover:rotate-12 transition-transform", feature.bg, feature.color)}>
                  <feature.icon size={40} />
                </div>
                <h3 className="text-2xl font-black tracking-tighter mb-4">{feature.title}</h3>
                <p className="text-secondary-foreground font-bold opacity-50 text-base leading-relaxed leading-relaxed">{feature.desc}</p>
                <div className="absolute -bottom-6 -right-6 text-white/5 font-black text-9xl group-hover:scale-150 transition-all duration-1000">0{i+1}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 📊 High-Precision Analysis Demo Section */}
      <section className="px-6 py-32 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
         <div className="space-y-8 animate-entry">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter">دقة متناهية. نتائج فورية.</h2>
            <p className="text-lg text-secondary-foreground font-bold opacity-60 leading-relaxed font-arabic">
              نظامنا لا يعطي مجرد أرقام تقريبية. نحن نقدم معامل "الجاهزية الحيوية" بدقة تصل للأعشار (مثل 87.9%)، مما يسمح للمدربين واللاعبين بفهم أدق تفاصيل الاستشفاء البدني.
            </p>
            <div className="flex flex-wrap gap-4">
               {['Precision AI', 'Real-time Analytics', 'rPPG Logic', 'Focus Index'].map((tag) => (
                 <span key={tag} className="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">{tag}</span>
               ))}
            </div>
         </div>
         <div className="relative group animate-entry shadow-2xl rounded-[4rem] overflow-hidden border border-white/5">
            <div className="bg-gradient-to-br from-primary/30 to-blue-600/30 p-24 text-center">
               <div className="w-32 h-32 bg-card rounded-full mx-auto border-4 border-primary flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(15,110,86,0.3)]">
                  <span className="text-4xl font-black text-primary">87.9</span>
               </div>
               <p className="text-xs font-black uppercase tracking-[0.5em] opacity-40">Elite Health Score Detected</p>
            </div>
         </div>
      </section>

      {/* Stadium Context */}
      <section className="px-6 py-32 max-w-6xl mx-auto flex flex-col md:flex-row gap-10">
          <div className="flex-1 glass-card border-white/5 p-12 rounded-[4rem] flex flex-col justify-between space-y-12 animate-entry">
            <div className="space-y-6">
               <div className="w-16 h-16 bg-primary text-white rounded-3xl flex items-center justify-center shadow-2xl">
                 <Trophy size={32} />
               </div>
               <h3 className="text-4xl font-black tracking-tighter">قوة البيانات في يد اللاعب</h3>
               <p className="text-secondary-foreground font-bold text-lg opacity-60 leading-relaxed font-arabic">
                 كلاعب، عيون الأداء تعطيك الضوء الأخضر للانطلاق. تجنب الإصابات بالإرهاق الزائد، وافهم جسدك تماماً كما تفهم اللعبة.
               </p>
            </div>
            <ul className="space-y-4">
              {['فحص يومي قبل التمرين', 'توصيات استشفاء مخصصة', 'تتبع تطور الجاهزية'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-primary">
                  <ShieldCheck size={18} /> {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex-1 glass-card border-white/5 p-12 rounded-[4rem] flex flex-col justify-between space-y-12 animate-entry" style={{ animationDelay: '0.2s' }}>
            <div className="space-y-6">
               <div className="w-16 h-16 bg-warning text-black rounded-3xl flex items-center justify-center shadow-2xl">
                 <Target size={32} />
               </div>
               <h3 className="text-4xl font-black tracking-tighter">الرؤية الشاملة للمدرب</h3>
               <p className="text-secondary-foreground font-bold text-lg opacity-60 leading-relaxed font-arabic">
                 كويسرة فنية، لا تترك شيئاً للصدفة. شاهد جاهزية فريقك بالكامل في لوحة واحدة، اتخذ قرارات التبديل بناءً على العلم لا الحظ.
               </p>
            </div>
            <ul className="space-y-4">
              {['تنبيهات خطر الإصابة لللاعبين', 'إدارة الفريق بشيفرة خاصة', 'تحليلات أداء الفريق الكامل'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-warning">
                  <ShieldCheck size={18} /> {item}
                </li>
              ))}
            </ul>
          </div>
      </section>

      {/* 📣 Final CTA */}
      <section className="px-6 py-32 text-center space-y-12 max-w-4xl mx-auto">
        <h2 className="text-5xl md:text-7xl font-black tracking-tighter glow-text">ابدأ عصر التدريب الذكي اليوم</h2>
        <p className="text-xl font-bold opacity-60 uppercase tracking-widest">Join 500+ elite teams already using AI</p>
        <div className="flex gap-4 justify-center">
            <Link href="/auth?role=coach">
              <Button className="h-20 px-12 btn-primary rounded-[1.5rem] text-2xl font-black tracking-tighter shadow-2xl hover:scale-105 transition-all">
                سجل ناديك الآن
              </Button>
            </Link>
        </div>
      </section>

      <footer className="p-16 text-center border-t border-white/5 bg-secondary/10">
        <p className="text-[10px] font-bold opacity-30 uppercase tracking-[0.5em]">Athlete Eyes Biometric Engine © 2026 | Developed by Advanced Agentic Coding</p>
      </footer>
    </div>
  );
}
