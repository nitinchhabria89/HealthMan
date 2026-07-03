const PROMPTS = [
  "What should I eat for dinner?",
  "Am I on track?",
  "I feel bloated",
  "Plan tomorrow's workout",
  "Review my day",
  "Best Indian breakfast for weight loss?",
];

export default function QuickPrompts({ onPick }: { onPick: (text: string) => void }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {PROMPTS.map((p) => (
        <button
          key={p}
          onClick={() => onPick(p)}
          className="whitespace-nowrap text-xs border border-borderLight rounded-btn px-3 py-1.5 text-textMuted"
        >
          {p}
        </button>
      ))}
    </div>
  );
}
