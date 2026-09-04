import { Link } from "react-router-dom";
import Reveal from "./Reveal";

function FinalCtaSection() {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8" style={{ background: "var(--sidebar)" }}>
      <Reveal className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold text-white sm:text-4xl">Take control of your spending.</h2>
        <p className="mt-4 text-base" style={{ color: "var(--sidebar-text)" }}>
          Join Spendex and start building better financial habits today.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to="/register"
            className="inline-flex items-center justify-center rounded-md px-6 py-3 text-base font-semibold text-white transition-colors"
            style={{ background: "var(--primary)" }}
            onMouseEnter={(event) => {
              event.currentTarget.style.background = "var(--primary-hover)";
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.background = "var(--primary)";
            }}
          >
            Get Started
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center justify-center rounded-md border px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-white/10"
            style={{ borderColor: "var(--sidebar-text)" }}
          >
            Sign In
          </Link>
        </div>
      </Reveal>
    </section>
  );
}

export default FinalCtaSection;
