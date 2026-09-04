type SummaryCardProps = {
  title: string;
  value: string;
  tone?: "income" | "expense" | "neutral" | "warning";
};

const toneClasses: Record<NonNullable<SummaryCardProps["tone"]>, string> = {
  income: "text-[var(--income)]",
  expense: "text-[var(--expense)]",
  warning: "text-[var(--warning)]",
  neutral: "text-[var(--text-primary)]",
};

function SummaryCard({ title, value, tone = "neutral" }: SummaryCardProps) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
      <p className="text-sm text-[var(--text-secondary)]">{title}</p>
      <p className={`mt-3 text-2xl font-semibold ${toneClasses[tone]}`}>{value}</p>
    </div>
  );
}

export default SummaryCard;
