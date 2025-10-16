import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateUTC } from "@/lib/dateUtils";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface ReconciliationDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionId: string | null;
}

interface TransactionData {
  id: string;
  date: string;
  name: string;
  car?: string;
  depositor?: string;
  value: string;
  status: string;
  confidence?: number;
  source?: string;
  paymentMethod?: string;
}

interface MatchResponse {
  original: TransactionData;
  matched: TransactionData;
}

export function ReconciliationDetailsDialog({
  open,
  onOpenChange,
  transactionId,
}: ReconciliationDetailsDialogProps) {
  const { data, isLoading, error } = useQuery<MatchResponse>({
    queryKey: [`/api/transactions/${transactionId}/match`],
    enabled: open && !!transactionId,
  });

  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(numValue);
  };

  const getSourceLabel = (source?: string) => {
    if (!source) return "Unknown";
    if (source.includes("sheet")) return "Google Sheets (Ledger)";
    if (source.includes("csv")) return "Bank Statement (CSV)";
    if (source.includes("ofx")) return "Bank Statement (OFX)";
    return source;
  };

  const valuesMatch = data && parseFloat(data.original.value) === parseFloat(data.matched.value);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl" data-testid="dialog-reconciliation-details">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Reconciliation Details
          </DialogTitle>
          <DialogDescription>
            Compare the matched transactions between ledger and bank statement
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : data ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded-lg p-4 space-y-3" data-testid="card-original-transaction">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-muted-foreground">
                    {getSourceLabel(data.original.source)}
                  </h3>
                  <Badge variant="outline" className="text-xs">
                    Original
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <div className="text-xs text-muted-foreground">Date</div>
                    <div className="font-medium" data-testid="text-original-date">
                      {formatDateUTC(new Date(data.original.date))}
                    </div>
                  </div>

                  {(data.original.source?.includes("sheet") || data.original.source?.includes("Sheet")) ? (
                    <>
                      <div>
                        <div className="text-xs text-muted-foreground">Client Name</div>
                        <div className="font-medium" data-testid="text-original-name">
                          {data.original.name}
                        </div>
                      </div>
                      {data.original.depositor && (
                        <div>
                          <div className="text-xs text-muted-foreground">Depositor Name</div>
                          <div className="font-medium" data-testid="text-original-depositor">
                            {data.original.depositor}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div>
                      <div className="text-xs text-muted-foreground">Name / Depositor</div>
                      <div className="font-medium" data-testid="text-original-name">
                        {data.original.depositor || data.original.name}
                      </div>
                    </div>
                  )}

                  {data.original.car && (
                    <div>
                      <div className="text-xs text-muted-foreground">Car</div>
                      <div className="font-medium">{data.original.car}</div>
                    </div>
                  )}

                  <div>
                    <div className="text-xs text-muted-foreground">Amount</div>
                    <div className="font-mono text-lg" data-testid="text-original-value">
                      {formatCurrency(data.original.value)}
                    </div>
                  </div>

                  {data.original.paymentMethod && (
                    <div>
                      <div className="text-xs text-muted-foreground">Payment Method</div>
                      <div className="font-medium">{data.original.paymentMethod}</div>
                    </div>
                  )}
                </div>
              </div>

              <div className="border rounded-lg p-4 space-y-3" data-testid="card-matched-transaction">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-muted-foreground">
                    {getSourceLabel(data.matched.source)}
                  </h3>
                  <Badge variant="outline" className="text-xs">
                    Matched
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <div className="text-xs text-muted-foreground">Date</div>
                    <div className="font-medium" data-testid="text-matched-date">
                      {formatDateUTC(new Date(data.matched.date))}
                    </div>
                  </div>

                  {(data.matched.source?.includes("sheet") || data.matched.source?.includes("Sheet")) ? (
                    <>
                      <div>
                        <div className="text-xs text-muted-foreground">Client Name</div>
                        <div className="font-medium" data-testid="text-matched-name">
                          {data.matched.name}
                        </div>
                      </div>
                      {data.matched.depositor && (
                        <div>
                          <div className="text-xs text-muted-foreground">Depositor Name</div>
                          <div className="font-medium" data-testid="text-matched-depositor">
                            {data.matched.depositor}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div>
                      <div className="text-xs text-muted-foreground">Name / Depositor</div>
                      <div className="font-medium" data-testid="text-matched-name">
                        {data.matched.depositor || data.matched.name}
                      </div>
                    </div>
                  )}

                  {data.matched.car && (
                    <div>
                      <div className="text-xs text-muted-foreground">Car</div>
                      <div className="font-medium">{data.matched.car}</div>
                    </div>
                  )}

                  <div>
                    <div className="text-xs text-muted-foreground">Amount</div>
                    <div className="font-mono text-lg" data-testid="text-matched-value">
                      {formatCurrency(data.matched.value)}
                    </div>
                  </div>

                  {data.matched.paymentMethod && (
                    <div>
                      <div className="text-xs text-muted-foreground">Payment Method</div>
                      <div className="font-medium">{data.matched.paymentMethod}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-sm font-medium">Reconciliation Status</div>
                  <div className="text-xs text-muted-foreground">
                    Confidence: {data.original.confidence || 100}%
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {valuesMatch ? (
                    <div className="flex items-center gap-2 text-green-600" data-testid="status-values-match">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-sm font-medium">Values Match</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-orange-600" data-testid="status-values-mismatch">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Values Don't Match</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No reconciliation data found
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
