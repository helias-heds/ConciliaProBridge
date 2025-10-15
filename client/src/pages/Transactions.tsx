import { useQuery } from "@tanstack/react-query";

export default function Transactions() {
  const { data: apiTransactions, isLoading } = useQuery<any[]>({
    queryKey: ["/api/transactions"],
  });

  const transactions = (apiTransactions || []).map(t => ({
    ...t,
    date: new Date(t.date),
    value: parseFloat(t.value),
  }));

  const pendingLedger = transactions.filter(t => t.status === "pending-ledger");

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
      
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <div className="p-4 border rounded-lg" data-testid="card-pending-ledger">
          <div className="text-sm text-muted-foreground">Pending Ledger</div>
          <div className="text-2xl font-bold">{pendingLedger.length}</div>
        </div>
      </div>

      <div className="border rounded-lg" data-testid="transactions-table">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="p-4 text-left">Date</th>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Value</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Source</th>
            </tr>
          </thead>
          <tbody>
            {transactions.slice(0, 20).map((t) => (
              <tr key={t.id} className="border-b">
                <td className="p-4">{t.date.toLocaleDateString()}</td>
                <td className="p-4">{t.name}</td>
                <td className="p-4">${t.value.toFixed(2)}</td>
                <td className="p-4">{t.status}</td>
                <td className="p-4">{t.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-4 text-sm text-muted-foreground">
          Showing {Math.min(20, transactions.length)} of {transactions.length} transactions
        </div>
      </div>
    </div>
  );
}
