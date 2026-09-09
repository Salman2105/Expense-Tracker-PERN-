import { useEffect, useId, useRef, useState } from "react";

export type ResponsiveSelectOption = {
  value: string;
  label: string;
};

type ResponsiveSelectProps = {
  label: string;
  value: string;
  options: ResponsiveSelectOption[];
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
};

function ResponsiveSelect({
  label,
  value,
  options,
  onChange,
  className = "",
  placeholder = "Select an option",
  disabled = false,
}: ResponsiveSelectProps) {
  const listboxId = useId();
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(() => {
    const selectedIndex = options.findIndex((option) => option.value === value);
    return selectedIndex >= 0 ? selectedIndex : 0;
  });

  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    const handlePointer = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointer);
    return () => document.removeEventListener("mousedown", handlePointer);
  }, []);

  const openDropdown = () => {
    if (disabled) return;
    setIsOpen(true);
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };

  const selectValue = (nextValue: string) => {
    onChange(nextValue);
    setIsOpen(false);
  };

  return (
    <div className={["relative w-full max-w-full min-w-0 box-border", className].join(" ")} ref={wrapperRef}>
      <button
        type="button"
        role="combobox"
        aria-label={label}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        aria-expanded={isOpen}
        aria-disabled={disabled}
        disabled={disabled}
        className="flex w-full max-w-full min-w-0 box-border items-center justify-between rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-left text-sm font-normal text-[var(--text-primary)] shadow-sm transition-colors duration-180 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-1"
        onClick={() => {
          if (isOpen) closeDropdown();
          else openDropdown();
        }}
        onKeyDown={(event) => {
          if (disabled) return;

          if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
            event.preventDefault();
          }

          if (event.key === "ArrowDown") {
            openDropdown();
            setHighlightedIndex((current) => Math.min(current + 1, options.length - 1));
          }

          if (event.key === "ArrowUp") {
            openDropdown();
            setHighlightedIndex((current) => Math.max(current - 1, 0));
          }

          if (event.key === "Enter" || event.key === " ") {
            if (isOpen) {
              selectValue(options[highlightedIndex]?.value ?? value);
            } else {
              openDropdown();
            }
          }

          if (event.key === "Escape") {
            closeDropdown();
          }
        }}
      >
        <span className="min-w-0 flex-1 truncate">
          {selected?.label ?? placeholder}
        </span>
        <svg
          aria-hidden="true"
          className={[
            "ml-2 h-4 w-4 shrink-0 transition-transform",
            isOpen ? "rotate-180" : "",
          ].join(" ")}
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M5 7l5 5 5-5" />
        </svg>
      </button>

      {isOpen && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute left-0 top-full z-[60] mt-1 max-h-56 w-full min-w-0 max-w-full overflow-y-auto rounded-md border border-[var(--border)] bg-[var(--surface)] shadow-xl"
          aria-label={label}
        >
          {options.map((option, index) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={value === option.value}
              className={[
                "flex w-full min-w-0 max-w-full items-center justify-start px-3 py-2 text-left text-sm transition-colors",
                "break-words outline-none",
                value === option.value
                  ? "bg-[var(--primary)] text-white"
                  : highlightedIndex === index
                    ? "bg-[var(--surface-secondary)] text-[var(--text-primary)]"
                    : "text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]",
              ].join(" ")}
              onMouseEnter={() => setHighlightedIndex(index)}
              onClick={() => selectValue(option.value)}
            >
              <span className="min-w-0 flex-1 truncate">{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ResponsiveSelect;
