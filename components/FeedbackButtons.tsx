"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Check, X, HelpCircle } from "lucide-react";

export default function FeedbackButtons({ scanId, playerId }: { scanId: string, playerId: string }) {
  const [submitted, setSubmitted] = useState(false);

  const handleFeedback = async (rating: 'accurate' | 'inaccurate' | 'unsure') => {
    const { error } = await supabase
      .from('scan_feedback')
      .insert({ scan_id: scanId, player_id: playerId, rating });

    if (!error) setSubmitted(true);
  };

  if (submitted) return (
    <div className="text-center p-4 bg-primary/10 rounded-xl text-primary font-bold animate-in zoom-in-95">
      شكراً لمشاركتك! سنستخدم ملاحظاتك لتحسين دقة الموديل.
    </div>
  );

  return (
    <div className="space-y-4">
      <h3 className="text-center font-bold">هل النتيجة تعكس إحساسك الحقيقي؟</h3>
      <div className="grid grid-cols-3 gap-3">
        <Button 
          variant="outline" 
          onClick={() => handleFeedback('accurate')} 
          className="flex flex-col gap-2 h-20 border-primary/20 hover:bg-primary/10 text-primary"
        >
          <Check />
          <span className="text-xs">دقيقة</span>
        </Button>
        <Button 
          variant="outline" 
          onClick={() => handleFeedback('inaccurate')} 
          className="flex flex-col gap-2 h-20 border-danger/20 hover:bg-danger/10 text-danger"
        >
          <X />
          <span className="text-xs">غير دقيقة</span>
        </Button>
        <Button 
          variant="outline" 
          onClick={() => handleFeedback('unsure')} 
          className="flex flex-col gap-2 h-20 border-border hover:bg-secondary/50"
        >
          <HelpCircle />
          <span className="text-xs">مو متأكد</span>
        </Button>
      </div>
    </div>
  );
}
