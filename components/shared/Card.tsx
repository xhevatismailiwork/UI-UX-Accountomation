export function Card({ children, className="" }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white border border-slate-200 rounded-lg ${className}`}>{children}</div>;
}
