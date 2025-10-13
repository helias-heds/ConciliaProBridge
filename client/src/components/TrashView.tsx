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
import { ptBR } from "date-fns/locale";
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
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getDaysRemaining = (deletedAt: Date) => {
    const now = new Date();
    const diffTime = 15 * 24 * 60 * 60 * 1000 - (now.getTime() - deletedAt.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const handlePermanentDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir permanentemente esta transação? Esta ação não pode ser desfeita.")) {
      onPermanentDelete(id);
    }
  };

  if (trashedTransactions.length === 0) {
    return (
      <div className="border rounded-md p-12 text-center">
        <Trash2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Lixeira Vazia</h3>
        <p className="text-sm text-muted-foreground">
          Não há transações na lixeira no momento
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <div className="bg-muted/50 p-4 border-b">
        <p className="text-sm text-muted-foreground">
          Itens na lixeira são automaticamente excluídos após 15 dias. Você pode restaurá-los ou excluí-los permanentemente a qualquer momento.
        </p>
      </div>
      
      <Table>
        <TableHeader className="sticky top-0 bg-card">
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Nome / Descrição</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead>Deletado em</TableHead>
            <TableHead className="text-center">Dias Restantes</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trashedTransactions.map((transaction) => {
            const daysRemaining = getDaysRemaining(transaction.deletedAt);
            return (
              <TableRow key={transaction.id} data-testid={`row-trash-${transaction.id}`}>
                <TableCell className="font-mono text-sm">
                  {format(transaction.date, "dd/MM/yyyy", { locale: ptBR })}
                </TableCell>
                <TableCell>
                  <div className="space-y-0.5">
                    <div className="font-medium">{transaction.name}</div>
                    {transaction.description && (
                      <div className="text-sm text-muted-foreground">{transaction.description}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  {formatCurrency(transaction.value)}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {format(transaction.deletedAt, "dd/MM/yyyy HH:mm", { locale: ptBR })}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={daysRemaining <= 3 ? "destructive" : "secondary"}>
                    {daysRemaining} {daysRemaining === 1 ? "dia" : "dias"}
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
                      Restaurar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handlePermanentDelete(transaction.id)}
                      data-testid={`button-permanent-delete-${transaction.id}`}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
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
