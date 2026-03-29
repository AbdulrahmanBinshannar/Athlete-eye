"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { day: "الأحد", score: 82 },
  { day: "الاثنين", score: 75 },
  { day: "الثلاثاء", score: 90 },
  { day: "الأربعاء", score: 68 },
  { day: "الخميس", score: 72 },
  { day: "الجمعة", score: 85 },
  { day: "السبت", score: 78 },
];

export default function ReadinessChart({ data: customData }: { data?: any[] }) {
  const chartData = (customData || data).map(d => ({ ...d, score: d.score > 10 ? d.score : d.score * 10 }));

  return (
    <div className="w-full h-72 bg-card/40 backdrop-blur-md p-6 rounded-3xl border border-white/5 shadow-2xl animate-entry">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
          <defs>
            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0F6E56" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#0F6E56" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#2A2A3E" vertical={false} opacity={0.2} />
          <XAxis 
            dataKey="day" 
            stroke="#666" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false}
            dy={10}
          />
          <YAxis 
            stroke="#666" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false} 
            domain={[0, 100]}
            tickCount={6}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "rgba(26, 26, 46, 0.8)", 
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.1)", 
              borderRadius: "16px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.4)"
            }}
            itemStyle={{ color: "#10b981", fontWeight: "bold" }}
            cursor={{ stroke: '#0F6E56', strokeWidth: 2 }}
          />
          <Area 
            type="monotone" 
            dataKey="score" 
            stroke="#10b981" 
            strokeWidth={4} 
            fillOpacity={1} 
            fill="url(#colorScore)"
            animationBegin={300}
            animationDuration={2000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
