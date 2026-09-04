import { LineChart, PiggyBank, Sparkles, UserCog } from "lucide-react";
import Reveal from "./Reveal";

const UPDATES = [
  {
    icon: LineChart,
    title: "Smarter spending insights",
    description: "Deeper analysis of your habits over time.",
  },
  {
    icon: Sparkles,
    title: "Improved analytics",
    description: "More ways to visualize trends across categories.",
  },
  {
    icon: PiggyBank,
    title: "Savings-focused features",
    description: "Tools to help you set and track savings goals.",
  },
  {
    icon: UserCog,
    title: "Enhanced personalization",
    description: "More control over how your dashboard looks and works.",
  },
];

function ComingUpdatesSection() {
  return (
    <section id="updates" className="px-4 py-20 sm:px-6 lg:px-8" style={{ background: "var(--surface)" }}>
      <div className="mx-auto max-w-7xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--primary)" }}>
            Coming Updates
          </p>
          <h2 className="mt-2 text-3xl font-bold text-[var(--text-primary)] sm:text-4xl">
            What's next
          </h2>
          <p className="mt-4 text-base text-[var(--text-secondary)]">
            Planned improvements — not yet available.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {UPDATES.map((update, index) => (
            <Reveal key={update.title} delay={index * 80}>
              <div className="h-full rounded-xl border border-dashed border-[var(--border)] bg-[var(--background)] p-5">
                <span
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg"
                  style={{ background: "var(--primary-light)", color: "var(--primary-hover)" }}
                >
                  <update.icon size={18} aria-hidden="true" />
                </span>
                <h3 className="mt-3 text-sm font-semibold text-[var(--text-primary)]">{update.title}</h3>
                <p className="mt-1.5 text-xs text-[var(--text-secondary)]">{update.description}</p>
                <span
                  className="mt-3 inline-block rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide"
                  style={{ background: "var(--surface-secondary)", color: "var(--text-secondary)" }}
                >
                  Planned
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ComingUpdatesSection;
