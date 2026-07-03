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
      <div className="text-lg font-semibold mt-1" style={{ color: color || "#E8F4FF" }}>
        {value}
      </div>
    </div>
  );
}
