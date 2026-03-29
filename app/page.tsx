import Link from "next/link";
import { Activity, Camera, TrendingUp } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="p-6 flex justify-between items-center border-b border-border">
        <h1 className="text-2xl font-bold text-primary">Athlete Eyes</h1>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-8">
        <div className="space-y-4 max-w-2xl">
          <h2 className="text-5xl font-extrabold tracking-tight">
            حوّل كاميرا جوالك إلى <span className="text-primary">محلل جاهزية</span> رياضي
          </h2>
          <p className="text-secondary-foreground text-xl">
            نستخدم الذكاء الاصطناعي لتحليل تعابير عينيك ووجهك لتحديد مدى جاهزيتك للتمرين أو المباراة.
          </p>
        </div>

        {/* Demo Video/Placeholder */}
        <div className="w-full max-w-md aspect-video bg-card rounded-lg border border-border flex items-center justify-center relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent z-10" />
          <Camera className="w-20 h-20 text-primary opacity-20" />
          <span className="z-20 text-sm font-medium">فيديو توضيحي للفحص</span>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <Link href="/auth?role=player" className="flex-1 btn-primary text-lg font-bold text-center">
            أنا لاعب
          </Link>
          <Link href="/auth?role=coach" className="flex-1 bg-secondary border border-border px-4 py-2 rounded-md font-bold text-center hover:bg-secondary/80 transition-colors text-lg">
            أنا مدرب
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-secondary/30 py-16 px-6 border-t border-border">
        <h3 className="text-2xl font-bold text-center mb-12">كيف يعمل؟</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center text-primary">
              <Camera size={32} />
            </div>
            <h4 className="text-xl font-bold">1. فحص الكاميرا</h4>
            <p className="text-secondary-foreground">شغّل الكاميرا وسجّل فيديو قصير لمدة 20 ثانية لوجهك.</p>
          </div>
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center text-primary">
              <Activity size={32} />
            </div>
            <h4 className="text-xl font-bold">2. تحليل الذكاء الاصطناعي</h4>
            <p className="text-secondary-foreground">نقوم بتحليل نبض القلب، الـ HRV، ومعدل الرمش فوراً.</p>
          </div>
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center text-primary">
              <TrendingUp size={32} />
            </div>
            <h4 className="text-xl font-bold">3. تقرير الجاهزية</h4>
            <p className="text-secondary-foreground">احصل على درجة جاهزيتك وتوصيات مخصصة للتحسين.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="p-8 text-center border-t border-border text-sm text-secondary-foreground">
        © {new Date().getFullYear()} Athlete Eyes. جميع الحقوق محفوظة.
      </footer>
    </div>
  );
}
