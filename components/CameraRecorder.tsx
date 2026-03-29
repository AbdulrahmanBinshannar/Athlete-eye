"use client";

import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, StopCircle, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [status, setStatus] = useState<'idle' | 'initializing' | 'ready' | 'recording' | 'error'>('idle');

  const getSupportedMimeType = () => {
    const types = ['video/webm;codecs=vp8', 'video/webm', 'video/mp4', 'video/quicktime'];
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) return type;
    }
    return '';
  };

  const startStream = async () => {
    setStatus('initializing');
    setError("");
    try {
      const constraints = {
        video: { 
          facingMode: 'user', 
          width: { ideal: 1280 }, 
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: false
      };
      
      const s = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
      }
      setStatus('ready');
    } catch (err: any) {
      console.error("Camera error:", err);
      setStatus('error');
      if (err.name === 'NotAllowedError') {
        setError("Camera access denied. Please enable it in browser settings.");
      } else {
        setError("Could not start camera. Please ensure it's not being used by another app.");
      }
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
    
    const mimeType = getSupportedMimeType();
    if (!mimeType) {
      setError("Your browser doesn't support video recording.");
      return;
    }

    try {
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        onRecordingComplete(blob);
        setRecording(false);
        setStatus('ready');
        setTimeLeft(duration);
      };

      recorder.start(1000); // Collect data every second
      setRecording(true);
      setStatus('recording');
      
      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            if (recorder.state === 'recording') recorder.stop();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError("Failed to start recording.");
      setRecording(false);
      setStatus('ready');
    }
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full animate-entry">
      <div className={cn(
        "relative w-full aspect-[4/3] bg-black rounded-[2.5rem] overflow-hidden border-8 transition-all duration-500 shadow-2xl",
        status === 'recording' ? 'border-primary/50 scale-[1.02]' : 'border-white/5'
      )}>
        {status === 'initializing' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-secondary/50 backdrop-blur-md z-20">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <p className="text-xs font-black uppercase tracking-widest opacity-60">Initializing Optics...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-danger/10 backdrop-blur-xl z-20 p-8 text-center">
            <AlertCircle className="w-16 h-16 text-danger mb-4" />
            <h3 className="font-black text-xl tracking-tighter mb-2">Camera Access Required</h3>
            <p className="text-sm font-bold opacity-70 mb-6">{error}</p>
            <Button onClick={startStream} variant="outline" className="rounded-xl border-white/10 hover:bg-white/5">
              <RefreshCw className="ml-2 w-4 h-4" />
              Try Again
            </Button>
          </div>
        )}

        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className={cn(
            "w-full h-full object-cover scale-x-[-1] transition-opacity duration-700",
            status === 'ready' || status === 'recording' ? 'opacity-100' : 'opacity-0'
          )} 
        />
        
        {/* Futuristic Oval Frame Overlay */}
        <div className="absolute inset-0 pointer-events-none z-10">
          <div className="absolute inset-0 border-[60px] border-black/60 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]">
            <div className={cn(
              "w-full h-full border-2 rounded-[50%] transition-all duration-1000",
              status === 'recording' ? 'border-primary shadow-[0_0_30px_rgba(15,110,86,0.3)]' : 'border-white/20'
            )} />
          </div>
          
          {/* Scanning Line Animation */}
          {status === 'recording' && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[70%] h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-scan-line blur-[1px]" />
          )}
        </div>

        {status === 'recording' && (
          <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2">
            <div className="bg-primary/90 backdrop-blur-md px-6 py-2 rounded-2xl font-black text-3xl tracking-tighter shadow-2xl animate-pulse">
              00:{timeLeft.toString().padStart(2, '0')}
            </div>
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">Live Bio-Scan</div>
          </div>
        )}

        {status === 'ready' && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
            <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl flex items-center gap-2 border border-white/5">
              <CheckCircle2 size={14} className="text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Sensors Calibrated</span>
            </div>
          </div>
        )}
      </div>

      <div className="w-full flex flex-col gap-4">
        {status === 'ready' && (
          <Button 
            onClick={startRecording} 
            className="w-full h-20 btn-primary rounded-[2rem] text-2xl font-black tracking-tighter shadow-[0_20px_50px_rgba(15,110,86,0.3)] hover:scale-[1.02] transition-all"
          >
            <Camera className="ml-3 w-8 h-8" />
            START SCAN
          </Button>
        )}

        {status === 'recording' && (
          <div className="p-6 glass-card rounded-3xl border-white/5 flex flex-col items-center text-center gap-2">
            <p className="text-xl font-black tracking-tighter glow-text">KEEP STEADY</p>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Predicting neuro-readiness level...</p>
          </div>
        )}
      </div>
    </div>
  );
}
