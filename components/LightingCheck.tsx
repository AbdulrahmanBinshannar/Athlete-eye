"use client";

import { useEffect, useState } from "react";
import { Camera, Sun, AlertTriangle } from "lucide-react";

export default function LightingCheck({ videoRef }: { videoRef: React.RefObject<HTMLVideoElement> }) {
  const [brightness, setBrightness] = useState(0);
  const [warning, setWarning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (videoRef.current) {
        const canvas = document.createElement("canvas");
        canvas.width = 64;
        canvas.height = 48;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0, 64, 48);
          const imageData = ctx.getImageData(0, 0, 64, 48);
          let total = 0;
          for (let i = 0; i < imageData.data.length; i += 4) {
            total += (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
          }
          const avg = total / (imageData.data.length / 4);
          setBrightness(avg);
          setWarning(avg < 80);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [videoRef]);

  if (!warning) return null;

  return (
    <div className="flex items-center gap-2 bg-amber-500/20 text-warning px-4 py-3 rounded-lg border border-warning/30 animate-in fade-in zoom-in-95">
      <AlertTriangle className="w-5 h-5" />
      <span className="text-sm font-bold">الإضاءة منخفضة! انتقل لمكان أكثر إشراقاً لأفضل نتائج.</span>
    </div>
  );
}
