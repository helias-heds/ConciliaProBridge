import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { MoreVertical } from "lucide-react";

export interface Transaction {
  id: string;
  date: Date;
  name: string;
  car: string;
  depositor?: string;
  value: number;
  status: "reconciled" | "pending-ledger" | "pending-statement";
  confidence?: number;
}

interface TransactionTableProps {
  transactions: Transaction[];
  onSelectionChange?: (selectedIds: string[]) => void;
  onTransactionClick?: (transaction: Transaction) => void;
}

export function TransactionTable({ transactions, onSelectionChange, onTransactionClick }: TransactionTableProps) {
  const getStatusBadge = (status: Transaction["status"]) => {
    const variants = {
      reconciled: { label: "Reconciled", variant: "default" as const, color: "bg-chart-2 text-white border-chart-2" },
      "pending-ledger": { label: "Pending Ledger", variant: "secondary" as const, color: "bg-chart-3 text-white border-chart-3" },
      "pending-statement": { label: "Pending Statement", variant: "destructive" as const, color: "bg-chart-4 text-white border-chart-4" },
    };
    
    const config = variants[status];
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader className="sticky top-0 bg-card">
          <TableRow>
            <TableHead className="w-12">
              <Checkbox data-testid="checkbox-select-all" />
            </TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Name / Depositor</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-center">Confidence</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id} className="hover-elevate" data-testid={`row-transaction-${transaction.id}`}>
              <TableCell>
                <Checkbox data-testid={`checkbox-transaction-${transaction.id}`} />
              </TableCell>
              <TableCell className="font-mono text-sm">
                {format(transaction.date, "MM/dd/yyyy", { locale: enUS })}
              </TableCell>
              <TableCell>
                <div className="space-y-0.5">
                  <div className="font-medium">{transaction.name}</div>
                  {transaction.depositor && (
                    <div className="text-sm text-muted-foreground">
                      Depositor: {transaction.depositor}
                    </div>
                  )}
                  {transaction.car && (
                    <div className="text-sm text-muted-foreground">{transaction.car}</div>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right font-mono tabular-nums">
                {formatCurrency(transaction.value)}
              </TableCell>
              <TableCell>{getStatusBadge(transaction.status)}</TableCell>
              <TableCell className="text-center">
                {transaction.confidence !== undefined && (
                  <span className="text-sm text-muted-foreground">
                    {Math.round(transaction.confidence)}%
                  </span>
                )}
              </TableCell>
              <TableCell>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => onTransactionClick?.(transaction)}
                  data-testid={`button-actions-${transaction.id}`}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
