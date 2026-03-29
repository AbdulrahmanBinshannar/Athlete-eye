"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUp, ArrowDown, Activity } from "lucide-react";

interface Metric {
  type: string;
  label: string;
  baseline: number;
  today: number;
  unit: string;
}

export default function MetricsTable({ metrics }: { metrics: Metric[] }) {
  const getDiff = (m: Metric) => {
    const diff = m.today - m.baseline;
    const isIncrease = diff > 0;
    const color = isIncrease ? "text-primary" : "text-danger";
    
    return (
      <div className={`flex items-center gap-1 font-bold ${color}`}>
        {isIncrease ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
        {Math.abs(diff).toFixed(1)} {m.unit}
      </div>
    );
  };

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden shadow-2xl">
      <Table dir="rtl">
        <TableHeader className="bg-secondary/50">
          <TableRow>
            <TableHead className="text-right font-black">المؤشر</TableHead>
            <TableHead className="text-right font-black">خط الأساس</TableHead>
            <TableHead className="text-right font-black">اليوم</TableHead>
            <TableHead className="text-right font-black">الفرق</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {metrics.map((m) => (
            <TableRow key={m.type} className="border-border/50">
              <TableCell className="font-bold flex items-center gap-2">
                <Activity size={12} className="text-primary opacity-50" />
                {m.label}
              </TableCell>
              <TableCell>{m.baseline} {m.unit}</TableCell>
              <TableCell className="font-bold">{m.today} {m.unit}</TableCell>
              <TableCell>{getDiff(m)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
