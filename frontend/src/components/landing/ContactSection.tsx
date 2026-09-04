import { Mail } from "lucide-react";
import Reveal from "./Reveal";

function ContactSection() {
  return (
    <section id="contact" className="px-4 py-20 sm:px-6 lg:px-8" style={{ background: "var(--background)" }}>
      <Reveal className="mx-auto max-w-2xl text-center">
        <span
          className="inline-flex h-12 w-12 items-center justify-center rounded-full"
          style={{ background: "var(--primary-light)", color: "var(--primary-hover)" }}
        >
          <Mail size={20} aria-hidden="true" />
        </span>
        <h2 className="mt-4 text-3xl font-bold text-[var(--text-primary)] sm:text-4xl">Get in touch</h2>
        <p className="mt-4 text-base text-[var(--text-secondary)]">
          Have a question or feedback about Spendex? We'd love to hear from you.
        </p>
        <a
          href="mailto:support@spendex.app"
          className="mt-6 inline-flex items-center justify-center rounded-md px-6 py-3 text-sm font-semibold text-white transition-colors"
          style={{ background: "var(--primary)" }}
          onMouseEnter={(event) => {
            event.currentTarget.style.background = "var(--primary-hover)";
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.background = "var(--primary)";
          }}
        >
          support@spendex.app
        </a>
      </Reveal>
    </section>
  );
}

export default ContactSection;
