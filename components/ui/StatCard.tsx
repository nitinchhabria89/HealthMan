export default function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="bg-innerBg border border-borderLight rounded-input p-3">
      <div className="label">{label}</div>
      <div className="text-lg font-semibold mt-1" style={{ color: color || "#0F172A" }}>
        {value}
      </div>
    </div>
  );
}
