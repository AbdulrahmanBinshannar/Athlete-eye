import CoachNav from "@/components/CoachNav";

export default function CoachLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="pb-20">
      {children}
      <CoachNav />
    </div>
  );
}
