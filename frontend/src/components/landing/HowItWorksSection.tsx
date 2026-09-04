import Reveal from "./Reveal";

const STEPS = [
  {
    number: "01",
    title: "Create your account",
    description: "Sign up in minutes and set up your personal finance profile.",
  },
  {
    number: "02",
    title: "Record your income and expenses",
    description: "Log transactions and assign them to categories as they happen.",
  },
  {
    number: "03",
    title: "Understand your spending",
    description: "Review your dashboard to see trends, balances, and insights.",
  },
];

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="px-4 py-20 sm:px-6 lg:px-8" style={{ background: "var(--background)" }}>
      <div className="mx-auto max-w-7xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-[var(--text-primary)] sm:text-4xl">How it works</h2>
          <p className="mt-4 text-base text-[var(--text-secondary)]">
            Getting control of your finances takes three simple steps.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <Reveal key={step.number} delay={index * 100}>
              <div className="relative rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
                <span className="text-4xl font-bold" style={{ color: "var(--primary-light)" }}>
                  {step.number}
                </span>
                <h3 className="mt-4 text-lg font-semibold text-[var(--text-primary)]">{step.title}</h3>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">{step.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWorksSection;
