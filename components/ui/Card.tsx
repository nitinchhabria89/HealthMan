export default function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-surface border border-border rounded-card shadow-card p-4 ${className}`}>
      {children}
    </div>
  );
}
