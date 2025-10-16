import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { CheckCircle2, Calendar } from "lucide-react";
import { Transaction } from "./TransactionTable";

interface ManualReconcileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Transaction | null;
  candidateTransactions: Transaction[];
  onReconcile: (transactionId: string, matchId: string) => void;
}

export function ManualReconcileDialog({
  open,
  onOpenChange,
  transaction,
  candidateTransactions,
  onReconcile,
}: ManualReconcileDialogProps) {
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Reset selection and filters when dialog closes or transaction changes
  useEffect(() => {
    if (!open || !transaction) {
      setSelectedMatch(null);
      setStartDate("");
      setEndDate("");
    }
  }, [open, transaction]);

  // Filter candidates by date range
  const filteredCandidates = useMemo(() => {
    if (!startDate && !endDate) {
      return candidateTransactions;
    }

    return candidateTransactions.filter(candidate => {
      const candidateDate = new Date(candidate.date);
      candidateDate.setHours(0, 0, 0, 0);

      if (startDate && endDate) {
        const start = new Date(`${startDate}T00:00:00`);
        const end = new Date(`${endDate}T23:59:59.999`);
        return candidateDate >= start && candidateDate <= end;
      } else if (startDate) {
        const start = new Date(`${startDate}T00:00:00`);
        return candidateDate >= start;
      } else if (endDate) {
        const end = new Date(`${endDate}T23:59:59.999`);
        return candidateDate <= end;
      }
      return true;
    });
  }, [candidateTransactions, startDate, endDate]);

  if (!transaction) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  const handleConfirm = () => {
    if (selectedMatch) {
      onReconcile(transaction.id, selectedMatch);
      setSelectedMatch(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manual Reconciliation</DialogTitle>
          <DialogDescription>
            Select the matching transaction to reconcile manually
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-md border p-4 bg-muted/50">
            <h3 className="font-semibold mb-2">Source Transaction</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Date:</span>{" "}
                {format(transaction.date, "MM/dd/yyyy", { locale: enUS })}
              </div>
              <div>
                <span className="text-muted-foreground">Amount:</span>{" "}
                {formatCurrency(transaction.value)}
              </div>
              <div>
                <span className="text-muted-foreground">Name:</span> {transaction.name}
              </div>
              {transaction.depositor && (
                <div>
                  <span className="text-muted-foreground">Depositor:</span> {transaction.depositor}
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Select Matching Transaction</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {(startDate || endDate) && (
                  <span>Showing {filteredCandidates.length} of {candidateTransactions.length}</span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2 mb-3 border rounded-lg p-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <label className="text-sm text-muted-foreground">From:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-2 py-1 border rounded text-sm bg-background"
                data-testid="input-date-from-dialog"
              />
              <label className="text-sm text-muted-foreground ml-2">To:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-2 py-1 border rounded text-sm bg-background"
                data-testid="input-date-to-dialog"
              />
              {(startDate || endDate) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setStartDate("");
                    setEndDate("");
                  }}
                  data-testid="button-clear-date-dialog"
                >
                  Clear
                </Button>
              )}
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredCandidates.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {candidateTransactions.length === 0 
                    ? "No candidate transactions found" 
                    : "No transactions found for selected date range"}
                </p>
              ) : (
                filteredCandidates.map((candidate) => (
                  <button
                    key={candidate.id}
                    onClick={() => setSelectedMatch(candidate.id)}
                    className={`w-full text-left p-3 rounded-md border transition-colors hover-elevate ${
                      selectedMatch === candidate.id
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    }`}
                    data-testid={`button-candidate-${candidate.id}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                        <div>
                          <span className="text-muted-foreground">Date:</span>{" "}
                          {format(candidate.date, "MM/dd/yyyy", { locale: enUS })}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Amount:</span>{" "}
                          {formatCurrency(candidate.value)}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Name:</span> {candidate.name}
                        </div>
                        {candidate.depositor && (
                          <div>
                            <span className="text-muted-foreground">Depositor:</span> {candidate.depositor}
                          </div>
                        )}
                        {candidate.car && (
                          <div className="col-span-2">
                            <span className="text-muted-foreground">Car:</span> {candidate.car}
                          </div>
                        )}
                      </div>
                      {selectedMatch === candidate.id && (
                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedMatch(null);
                onOpenChange(false);
              }}
              data-testid="button-cancel-reconcile"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!selectedMatch}
              data-testid="button-confirm-reconcile"
            >
              Confirm Reconciliation
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
