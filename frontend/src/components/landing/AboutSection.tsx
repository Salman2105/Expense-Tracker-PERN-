import Reveal from "./Reveal";

function AboutSection() {
  return (
    <section id="about" className="px-4 py-20 sm:px-6 lg:px-8" style={{ background: "var(--background)" }}>
      <Reveal className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-bold text-[var(--text-primary)] sm:text-4xl">Why Spendex</h2>
        <p className="mt-5 text-base leading-relaxed text-[var(--text-secondary)] sm:text-lg">
          Spendex is a simple personal finance tool designed to help you record
          transactions, understand spending patterns, and maintain better awareness of
          your money — without unnecessary complexity.
        </p>
      </Reveal>
    </section>
  );
}

export default AboutSection;
