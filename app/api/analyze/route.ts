import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();
  const { scanType } = body;

  // Mock Analysis Logic
  // Returning high-precision scores (e.g., 87.9) for premium UI consistency
  const score = 78 + (Math.random() * 18.5);
  const color = score >= 85 ? 'green' : score >= 65 ? 'yellow' : 'red';

  return NextResponse.json({
    score: score,
    color: color,
    confidence: 0.85 + (Math.random() * 0.1),
    metrics: [
      { metric_type: 'hr', value: 65, baseline_diff: 6 },
      { metric_type: 'hrv', value: 68, baseline_diff: -6 },
      { metric_type: 'blink_rate', value: 20, baseline_diff: 2.4 },
      { metric_type: 'reaction_time', value: 225, baseline_diff: 13 }
    ]
  });
}
