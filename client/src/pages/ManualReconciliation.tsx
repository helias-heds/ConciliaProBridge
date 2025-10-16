import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ManualReconciliation() {
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [candidateTransactions, setCandidateTransactions] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: apiTransactions, isLoading } = useQuery<any[]>({
    queryKey: ["/api/transactions"],
  });

  const transactions = useMemo(() => 
    (apiTransactions || []).map(t => ({
      ...t,
      date: new Date(t.date),
      value: parseFloat(t.value),
    })),
    [apiTransactions]
  );

  // Transactions needing manual reconciliation (missing depositor)
  const needsManual = useMemo(() => 
    transactions.filter(t => 
      t.status === "pending-ledger" && 
      (!t.depositor || t.depositor === '')
    ),
    [transactions]
  );

  const reconcileMutation = useMutation({
    mutationFn: async ({ transactionId, matchId }: { transactionId: string; matchId: string }) => {
      return apiRequest("POST", "/api/transactions/manual-reconcile", {
        transactionId,
        matchId,
      });
    },
    onSuccess: async () => {
      // Wait for data to refresh before closing dialog
      await queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      
      toast({
        title: "Success",
        description: "Transactions reconciled successfully",
      });
      
      // Close dialog and reset state after data is refreshed
      setDialogOpen(false);
      setSelectedTransaction(null);
      setCandidateTransactions([]);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reconcile transactions",
        variant: "destructive",
      });
    },
  });

  const getCandidates = (transaction: any) => {
    if (!transaction) return [];
    
    // Find opposite status transactions
    const oppositeStatus = transaction.status === "pending-ledger" 
      ? "pending-statement" 
      : "pending-ledger";
    
    return transactions
      .filter(t => 
        t.status === oppositeStatus &&
        t.id !== transaction.id &&
        Math.abs(t.value - transaction.value) < 0.01 // Same value
      )
      .slice(0, 10); // Limit to 10 candidates
  };

  const handleReconcileClick = (transaction: any) => {
    setSelectedTransaction(transaction);
    setCandidateTransactions(getCandidates(transaction));
    setDialogOpen(true);
  };

  const handleConfirmReconcile = (matchId: string) => {
    if (!selectedTransaction || reconcileMutation.isPending) return;
    reconcileMutation.mutate({
      transactionId: selectedTransaction.id,
      matchId,
    });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">Manual Reconciliation</h1>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4" data-testid="page-title">Manual Reconciliation</h1>
      <p className="text-muted-foreground mb-6">
        Reconcile transactions with missing depositor information
      </p>

      <div className="grid gap-4 md:grid-cols-1 mb-6">
        <div className="p-4 border rounded-lg" data-testid="card-needs-manual">
          <div className="text-sm text-muted-foreground">Needs Manual Reconciliation</div>
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {needsManual.length}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            (Missing depositor info)
          </div>
        </div>
      </div>

      <div className="border rounded-lg" data-testid="reconciliation-table">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="p-4 text-left">Date</th>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Car</th>
              <th className="p-4 text-left">Depositor</th>
              <th className="p-4 text-left">Value</th>
              <th className="p-4 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {needsManual.slice(0, 100).map((t) => (
              <tr 
                key={t.id} 
                className="border-b bg-orange-50 dark:bg-orange-950/20"
                data-testid={`row-transaction-${t.id}`}
              >
                <td className="p-4">{t.date.toLocaleDateString()}</td>
                <td className="p-4">{t.name}</td>
                <td className="p-4">{t.car || <span className="text-muted-foreground">-</span>}</td>
                <td className="p-4">
                  <span className="text-orange-600 dark:text-orange-400 font-semibold">Empty</span>
                </td>
                <td className="p-4">${t.value.toFixed(2)}</td>
                <td className="p-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleReconcileClick(t)}
                    data-testid={`button-reconcile-${t.id}`}
                  >
                    <Link2 className="w-4 h-4 mr-1" />
                    Reconcile
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-4 text-sm text-muted-foreground">
          Showing {Math.min(100, needsManual.length)} of {needsManual.length} transactions
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manual Reconciliation</DialogTitle>
            <DialogDescription>
              Select a matching transaction to reconcile
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-orange-50 dark:bg-orange-950/20">
              <div className="text-sm font-semibold mb-2">Selected Transaction (Ledger)</div>
              {selectedTransaction && (
                <div className="space-y-1 text-sm">
                  <div><span className="text-muted-foreground">Date:</span> {selectedTransaction.date.toLocaleDateString()}</div>
                  <div><span className="text-muted-foreground">Name:</span> {selectedTransaction.name}</div>
                  <div><span className="text-muted-foreground">Value:</span> ${selectedTransaction.value.toFixed(2)}</div>
                  <div><span className="text-muted-foreground">Car:</span> {selectedTransaction.car || '-'}</div>
                </div>
              )}
            </div>

            <div>
              <div className="text-sm font-semibold mb-2">Candidate Matches ({candidateTransactions.length})</div>
              {candidateTransactions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No matching transactions found</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {candidateTransactions.map((candidate) => (
                    <div
                      key={candidate.id}
                      className={`p-3 border rounded-lg ${
                        reconcileMutation.isPending 
                          ? 'opacity-50 cursor-not-allowed' 
                          : 'hover-elevate cursor-pointer'
                      }`}
                      onClick={() => !reconcileMutation.isPending && handleConfirmReconcile(candidate.id)}
                      data-testid={`candidate-${candidate.id}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-1 text-sm flex-1">
                          <div><span className="text-muted-foreground">Date:</span> {candidate.date.toLocaleDateString()}</div>
                          <div><span className="text-muted-foreground">Name:</span> {candidate.name}</div>
                          <div><span className="text-muted-foreground">Value:</span> ${candidate.value.toFixed(2)}</div>
                          <div><span className="text-muted-foreground">Source:</span> {candidate.source}</div>
                        </div>
                        <Button 
                          size="sm" 
                          variant="default"
                          disabled={reconcileMutation.isPending}
                        >
                          {reconcileMutation.isPending ? "Matching..." : "Match"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
