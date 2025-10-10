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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MoreVertical, CheckCircle2, Clock, AlertCircle } from "lucide-react";

export interface Transaction {
  id: string;
  date: Date;
  description: string;
  value: number;
  status: "reconciled" | "pending-ledger" | "pending-statement";
  confidence?: number;
}

interface TransactionTableProps {
  transactions: Transaction[];
  onSelectionChange?: (selectedIds: string[]) => void;
  onStatusChange?: (transactionId: string, newStatus: Transaction["status"]) => void;
}

export function TransactionTable({ transactions, onSelectionChange, onStatusChange }: TransactionTableProps) {
  const getStatusBadge = (status: Transaction["status"]) => {
    const variants = {
      reconciled: { label: "Conciliado", variant: "default" as const, color: "bg-chart-2 text-white border-chart-2" },
      "pending-ledger": { label: "Pendente Planilha", variant: "secondary" as const, color: "bg-chart-3 text-white border-chart-3" },
      "pending-statement": { label: "Pendente Extrato", variant: "destructive" as const, color: "bg-chart-4 text-white border-chart-4" },
    };
    
    const config = variants[status];
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
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
            <TableHead>Data</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-center">Confiança</TableHead>
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
                {format(transaction.date, "dd/MM/yyyy", { locale: ptBR })}
              </TableCell>
              <TableCell>{transaction.description}</TableCell>
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" data-testid={`button-actions-${transaction.id}`}>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {transaction.status !== "reconciled" && (
                      <DropdownMenuItem
                        onClick={() => onStatusChange?.(transaction.id, "reconciled")}
                        data-testid={`action-reconcile-${transaction.id}`}
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4 text-chart-2" />
                        Marcar como Conciliado
                      </DropdownMenuItem>
                    )}
                    {transaction.status !== "pending-ledger" && (
                      <DropdownMenuItem
                        onClick={() => onStatusChange?.(transaction.id, "pending-ledger")}
                        data-testid={`action-pending-ledger-${transaction.id}`}
                      >
                        <Clock className="mr-2 h-4 w-4 text-chart-3" />
                        Mover para Pendente Planilha
                      </DropdownMenuItem>
                    )}
                    {transaction.status !== "pending-statement" && (
                      <DropdownMenuItem
                        onClick={() => onStatusChange?.(transaction.id, "pending-statement")}
                        data-testid={`action-pending-statement-${transaction.id}`}
                      >
                        <AlertCircle className="mr-2 h-4 w-4 text-chart-4" />
                        Mover para Pendente Extrato
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
