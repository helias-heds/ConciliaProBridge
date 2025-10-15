import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export default function Transactions() {
  const [filter, setFilter] = useState<"all" | "needs-manual">("all");
  
  const { data: apiTransactions, isLoading } = useQuery<any[]>({
    queryKey: ["/api/transactions"],
  });

  const transactions = (apiTransactions || []).map(t => ({
    ...t,
    date: new Date(t.date),
    value: parseFloat(t.value),
  }));

  const pendingLedger = transactions.filter(t => t.status === "pending-ledger");
  
  // Transactions that need manual reconciliation (missing depositor or other fields)
  const needsManualReconciliation = transactions.filter(t => 
    t.status === "pending-ledger" && 
    (!t.depositor || t.depositor === '')
  );
  
  const displayTransactions = filter === "needs-manual" 
    ? needsManualReconciliation 
    : transactions;

  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">All Transactions</h1>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4" data-testid="page-title">All Transactions</h1>
      <p className="text-muted-foreground mb-6">View and manage all transaction records</p>
      
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <div className="p-4 border rounded-lg" data-testid="card-pending-ledger">
          <div className="text-sm text-muted-foreground">Pending Ledger</div>
          <div className="text-2xl font-bold">{pendingLedger.length}</div>
        </div>
        
        <div 
          className="p-4 border rounded-lg cursor-pointer hover-elevate" 
          data-testid="card-needs-manual"
          onClick={() => setFilter(filter === "needs-manual" ? "all" : "needs-manual")}
        >
          <div className="text-sm text-muted-foreground">Need Manual Reconciliation</div>
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {needsManualReconciliation.length}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            (Missing depositor info)
          </div>
        </div>

        <div className="p-4 border rounded-lg">
          <div className="text-sm text-muted-foreground">Total Transactions</div>
          <div className="text-2xl font-bold">{transactions.length}</div>
        </div>
      </div>

      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg border ${
            filter === "all" 
              ? "bg-primary text-primary-foreground" 
              : "hover-elevate"
          }`}
          data-testid="button-filter-all"
        >
          All Transactions
        </button>
        <button
          onClick={() => setFilter("needs-manual")}
          className={`px-4 py-2 rounded-lg border ${
            filter === "needs-manual" 
              ? "bg-orange-600 text-white dark:bg-orange-500" 
              : "hover-elevate"
          }`}
          data-testid="button-filter-manual"
        >
          Needs Manual Reconciliation ({needsManualReconciliation.length})
        </button>
      </div>

      <div className="border rounded-lg" data-testid="transactions-table">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="p-4 text-left">Date</th>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Car</th>
              <th className="p-4 text-left">Depositor</th>
              <th className="p-4 text-left">Value</th>
              <th className="p-4 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {displayTransactions.slice(0, 50).map((t) => (
              <tr 
                key={t.id} 
                className={`border-b ${
                  !t.depositor || t.depositor === '' 
                    ? 'bg-orange-50 dark:bg-orange-950/20' 
                    : ''
                }`}
                data-testid={`row-transaction-${t.id}`}
              >
                <td className="p-4">{t.date.toLocaleDateString()}</td>
                <td className="p-4">{t.name}</td>
                <td className="p-4">{t.car || <span className="text-muted-foreground">-</span>}</td>
                <td className="p-4">
                  {t.depositor || <span className="text-orange-600 dark:text-orange-400 font-semibold">Empty</span>}
                </td>
                <td className="p-4">${t.value.toFixed(2)}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs ${
                    t.status === 'reconciled' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                    t.status === 'pending-ledger' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {t.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-4 text-sm text-muted-foreground">
          Showing {Math.min(50, displayTransactions.length)} of {displayTransactions.length} transactions
        </div>
      </div>
    </div>
  );
}
