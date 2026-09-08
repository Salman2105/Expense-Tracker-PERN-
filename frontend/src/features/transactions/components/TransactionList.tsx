import type { Category } from "../../../domain/models/category";
import type { Transaction } from "../../../domain/models/transaction";
import { formatCurrency } from "../../../lib/formatters";
import { useSettings } from "../../settings/hooks/useSettings";

type TransactionListProps = {
  transactions: Transaction[];
  categories: Category[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
};

const dateFormatter = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

function TransactionList({ transactions, categories, onEdit, onDelete }: TransactionListProps) {
  const categoryNames = new Map(categories.map((category) => [category.categoryId, category.name]));
  const settingsQuery = useSettings();
  const currency = settingsQuery.data?.data.preferredCurrency;

  return (
    <>
      <div className="hidden max-h-[32rem] overflow-y-auto rounded-lg border border-[var(--border)] bg-[var(--surface)] md:block">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 z-10 bg-[var(--surface-secondary)] text-xs uppercase tracking-wide text-[var(--text-secondary)]"><tr><th className="px-4 py-3 font-medium">Title</th><th className="px-4 py-3 font-medium">Category</th><th className="px-4 py-3 font-medium">Date</th><th className="px-4 py-3 font-medium">Type</th><th className="px-4 py-3 text-right font-medium">Amount</th><th className="px-4 py-3 text-right font-medium">Actions</th></tr></thead>
          <tbody className="divide-y divide-[var(--border)]">
            {transactions.map((transaction) => <tr key={transaction.transactionId}>
              <td className="max-w-48 px-4 py-3"><p className="truncate font-medium text-[var(--text-primary)]">{transaction.title}</p>{transaction.note && <p className="mt-1 truncate text-xs text-[var(--text-secondary)]">{transaction.note}</p>}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{categoryNames.get(transaction.categoryId) ?? "Uncategorized"}</td>
              <td className="whitespace-nowrap px-4 py-3 text-[var(--text-secondary)]">{dateFormatter.format(new Date(transaction.transactionDate))}</td>
              <td className="px-4 py-3"><span className={transaction.type === "INCOME" ? "text-[var(--income)]" : "text-[var(--expense)]"}>{transaction.type === "INCOME" ? "Income" : "Expense"}</span></td>
              <td className={transaction.type === "INCOME" ? "px-4 py-3 text-right font-semibold text-[var(--income)]" : "px-4 py-3 text-right font-semibold text-[var(--expense)]"}>{formatCurrency(Number(transaction.amount), currency)}</td>
              <td className="whitespace-nowrap px-4 py-3 text-right"><button type="button" onClick={() => onEdit(transaction)} className="mr-3 text-sm font-medium text-[var(--primary)] hover:underline">Edit</button><button type="button" onClick={() => onDelete(transaction)} className="text-sm font-medium text-[var(--expense)] hover:underline">Delete</button></td>
            </tr>)}
          </tbody>
        </table>
      </div>
      <div className="max-h-[32rem] space-y-3 overflow-y-auto md:hidden">
        {transactions.map((transaction) => <article key={transaction.transactionId} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4"><div className="flex justify-between gap-3"><div className="min-w-0"><h2 className="truncate font-semibold text-[var(--text-primary)]">{transaction.title}</h2><p className="mt-1 text-sm text-[var(--text-secondary)]">{categoryNames.get(transaction.categoryId) ?? "Uncategorized"} · {dateFormatter.format(new Date(transaction.transactionDate))}</p></div><span className={transaction.type === "INCOME" ? "shrink-0 font-semibold text-[var(--income)]" : "shrink-0 font-semibold text-[var(--expense)]"}>{formatCurrency(Number(transaction.amount))}</span></div>{transaction.note && <p className="mt-3 text-sm text-[var(--text-secondary)]">{transaction.note}</p>}<div className="mt-4 flex gap-4"><button type="button" onClick={() => onEdit(transaction)} className="text-sm font-medium text-[var(--primary)]">Edit</button><button type="button" onClick={() => onDelete(transaction)} className="text-sm font-medium text-[var(--expense)]">Delete</button></div></article>)}
      </div>
    </>
  );
}

export function TransactionListSkeleton() {
  return <div className="space-y-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">{Array.from({ length: 6 }, (_, index) => <div key={index} className="h-14 animate-pulse rounded-md bg-[var(--surface-secondary)]" />)}</div>;
}

export default TransactionList;