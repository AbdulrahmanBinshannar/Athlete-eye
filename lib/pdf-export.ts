"use client";

// Simple CSV export for now as a fallback for the MVP readiness report
// In a full production app, @react-pdf/renderer would be used to generate a formal document

export function exportTeamReportCSV(teamName: string, players: any[]) {
  const headers = ["اللاعب", "درجة الجاهزية", "الحالة", "آخر فحص"];
  const rows = players.map(p => [
    p.name,
    p.last_scan.readiness_score.toFixed(1),
    p.last_scan.status_color === 'green' ? 'جاهز' : p.last_scan.status_color === 'yellow' ? 'حذر' : 'مرهق',
    new Date(p.last_scan.created_at).toLocaleDateString('ar-EG')
  ]);

  const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `تقرير_جاهزية_${teamName}_${new Date().toLocaleDateString('ar-EG')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
