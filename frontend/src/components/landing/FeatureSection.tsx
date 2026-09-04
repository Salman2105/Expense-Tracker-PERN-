import {
  LayoutDashboard,
  PieChart,
  ShieldCheck,
  SlidersHorizontal,
  Tags,
  Wallet,
} from "lucide-react";
import Reveal from "./Reveal";

const FEATURES = [
  {
    icon: Wallet,
    title: "Expense & Income Tracking",
    description:
      "Record every transaction in seconds and keep an accurate picture of your finances.",
  },
  {
    icon: Tags,
    title: "Categories",
    description:
      "Organize spending into custom categories so you always know where money goes.",
  },
  {
    icon: PieChart,
    title: "Spending Analytics",
    description:
      "Visualize category distribution and income vs. expenses with clear charts.",
  },
  {
    icon: LayoutDashboard,
    title: "Dashboard Insights",
    description:
      "See totals, balances, and trends at a glance from a single dashboard.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Account",
    description:
      "Your financial data is protected with secure authentication and account controls.",
  },
  {
    icon: SlidersHorizontal,
    title: "Personalized Settings",
    description:
      "Set your preferred currency and tailor the app to how you manage money.",
  },
];

function FeatureSection() {
  return (
    <section id="features" className="px-4 py-20 sm:px-6 lg:px-8" style={{ background: "var(--surface)" }}>
      <div className="mx-auto max-w-7xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-[var(--text-primary)] sm:text-4xl">
            Everything you need to manage your money
          </h2>
          <p className="mt-4 text-base text-[var(--text-secondary)]">
            Focused tools for tracking, organizing, and understanding your spending.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, index) => (
            <Reveal key={feature.title} delay={index * 80}>
              <div className="h-full rounded-xl border border-[var(--border)] bg-[var(--background)] p-6 transition-transform hover:-translate-y-1 hover:shadow-md">
                <span
                  className="inline-flex h-11 w-11 items-center justify-center rounded-lg"
                  style={{ background: "var(--primary-light)", color: "var(--primary-hover)" }}
                >
                  <feature.icon size={22} aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-lg font-semibold text-[var(--text-primary)]">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">{feature.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeatureSection;
