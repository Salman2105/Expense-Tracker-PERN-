import type { PropsWithChildren } from "react";
import { useReveal } from "./useReveal";

type RevealProps = PropsWithChildren<{
  className?: string;
  delay?: number;
}>;

function Reveal({ children, className = "", delay = 0 }: RevealProps) {
  const { ref, isVisible } = useReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out motion-reduce:transition-none motion-reduce:transform-none ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      } ${className}`}
      style={{ transitionDelay: isVisible ? `${delay}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}

export default Reveal;
