import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { RotateCcw, Trash2 } from "lucide-react";
import type { Transaction } from "./TransactionTable";

interface TrashedTransaction extends Transaction {
  deletedAt: Date;
}

interface TrashViewProps {
  trashedTransactions: TrashedTransaction[];
  onRestore: (id: string) => void;
  onPermanentDelete: (id: string) => void;
}

export function TrashView({ trashedTransactions, onRestore, onPermanentDelete }: TrashViewProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  const getDaysRemaining = (deletedAt: Date) => {
    const now = new Date();
    const diffTime = 15 * 24 * 60 * 60 * 1000 - (now.getTime() - deletedAt.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const handlePermanentDelete = (id: string) => {
    if (confirm("Are you sure you want to permanently delete this transaction? This action cannot be undone.")) {
      onPermanentDelete(id);
    }
  };

  if (trashedTransactions.length === 0) {
    return (
      <div className="border rounded-md p-12 text-center">
        <Trash2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Trash is Empty</h3>
        <p className="text-sm text-muted-foreground">
          There are no transactions in the trash
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <div className="bg-muted/50 p-4 border-b">
        <p className="text-sm text-muted-foreground">
          Items in trash are automatically deleted after 15 days. You can restore or permanently delete them at any time.
        </p>
      </div>
      
      <Table>
        <TableHeader className="sticky top-0 bg-card">
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Name / Car</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Deleted At</TableHead>
            <TableHead className="text-center">Days Remaining</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trashedTransactions.map((transaction) => {
            const daysRemaining = getDaysRemaining(transaction.deletedAt);
            return (
              <TableRow key={transaction.id} data-testid={`row-trash-${transaction.id}`}>
                <TableCell className="font-mono text-sm">
                  {format(transaction.date, "MM/dd/yyyy", { locale: enUS })}
                </TableCell>
                <TableCell>
                  <div className="space-y-0.5">
                    <div className="font-medium">{transaction.name}</div>
                    {transaction.car && (
                      <div className="text-sm text-muted-foreground">{transaction.car}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  {formatCurrency(transaction.value)}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {format(transaction.deletedAt, "MM/dd/yyyy HH:mm", { locale: enUS })}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={daysRemaining <= 3 ? "destructive" : "secondary"}>
                    {daysRemaining} {daysRemaining === 1 ? "day" : "days"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRestore(transaction.id)}
                      data-testid={`button-restore-${transaction.id}`}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Restore
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handlePermanentDelete(transaction.id)}
                      data-testid={`button-permanent-delete-${transaction.id}`}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
