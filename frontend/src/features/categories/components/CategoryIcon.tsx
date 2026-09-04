import { Bus, CircleDollarSign, Gamepad2, ReceiptText, ShoppingBag, Tag, Utensils } from "lucide-react";

const iconMap = {
  bills: ReceiptText,
  entertainment: Gamepad2,
  food: Utensils,
  salary: CircleDollarSign,
  shopping: ShoppingBag,
  transport: Bus,
  Uncategorized: Tag,
} as const;

type CategoryIconProps = {
  icon: string;
};

function CategoryIcon({ icon }: CategoryIconProps) {
  const Icon = iconMap[icon as keyof typeof iconMap] ?? Tag;

  return (
    <span
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[var(--primary-light)] text-sm font-semibold text-[var(--primary)]"
      aria-hidden="true"
    >
      <Icon size={20} strokeWidth={2} />
    </span>
  );
}

export default CategoryIcon;