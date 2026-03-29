"use client";

import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, StopCircle } from "lucide-react";

interface CameraRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
  duration?: number; // in seconds
}

export default function CameraRecorder({ onRecordingComplete, duration = 20 }: CameraRecorderProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recording, setRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [error, setError] = useState("");

  const startStream = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false
      });
      setStream(s);
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch (err) {
      setError("تعذر الوصول للكاميرا. يرجى السماح بالوصول.");
    }
  };

  useEffect(() => {
    startStream();
    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  const startRecording = () => {
    if (!stream) return;
    chunksRef.current = [];
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      onRecordingComplete(blob);
      setRecording(false);
      setTimeLeft(duration);
    };

    recorder.start();
    setRecording(true);
    
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          recorder.stop();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div className="relative w-full aspect-[4/3] bg-black rounded-2xl overflow-hidden border-4 border-card shadow-2xl">
        {stream ? (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className={`w-full h-full object-cover scale-x-[-1] ${recording ? 'border-4 border-danger animate-pulse' : ''}`} 
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
          </div>
        )}
        
        {/* Oval Frame Overlay */}
        <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none">
          <div className="w-full h-full border-2 border-primary/50 rounded-[50%] opacity-50" />
        </div>

        {recording && (
          <div className="absolute top-4 right-4 bg-danger px-4 py-2 rounded-full font-black text-xl animate-pulse">
            00:{timeLeft.toString().padStart(2, '0')}
          </div>
        )}
      </div>

      {error && <p className="text-danger font-bold">{error}</p>}

      {!recording ? (
        <Button onClick={startRecording} className="btn-primary w-full h-16 text-xl rounded-full" disabled={!stream}>
          <Camera className="ml-2 w-6 h-6" />
          ابدأ الفحص
        </Button>
      ) : (
        <p className="text-secondary-foreground font-medium">يرجى الثبات والبقاء داخل الإطار...</p>
      )}
    </div>
  );
}
