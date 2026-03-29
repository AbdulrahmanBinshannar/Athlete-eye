import BottomNav from "@/components/BottomNav";

export default function PlayerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="pb-24">
      {children}
      <BottomNav />
    </div>
  );
}
