import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";

interface MatchTransaction {
  date: string;
  description: string;
  value: number;
  source: string;
}

interface ManualMatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceTransaction?: MatchTransaction;
  targetTransaction?: MatchTransaction;
  confidence?: number;
}

export function ManualMatchDialog({
  open,
  onOpenChange,
  sourceTransaction,
  targetTransaction,
  confidence = 0,
}: ManualMatchDialogProps) {
  const handleConfirmMatch = () => {
    console.log("Match confirmed");
    onOpenChange(false);
  };

  const handleReject = () => {
    console.log("Match rejected");
    onOpenChange(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-96">
        <SheetHeader>
          <SheetTitle>Confirmar Correspondência Manual</SheetTitle>
          <SheetDescription>
            Revise os detalhes das transações e confirme a correspondência
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Planilha</Badge>
              <span className="text-sm text-muted-foreground">{sourceTransaction?.source}</span>
            </div>
            <div className="p-4 border rounded-md space-y-2">
              <p className="text-sm">
                <span className="text-muted-foreground">Data:</span>{" "}
                <span className="font-medium">{sourceTransaction?.date}</span>
              </p>
              <p className="text-sm">
                <span className="text-muted-foreground">Descrição:</span>{" "}
                <span className="font-medium">{sourceTransaction?.description}</span>
              </p>
              <p className="text-sm">
                <span className="text-muted-foreground">Valor:</span>{" "}
                <span className="font-medium tabular-nums">
                  {sourceTransaction && formatCurrency(sourceTransaction.value)}
                </span>
              </p>
            </div>
          </div>

          <div className="flex justify-center">
            <ArrowRight className="h-6 w-6 text-muted-foreground" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Extrato</Badge>
              <span className="text-sm text-muted-foreground">{targetTransaction?.source}</span>
            </div>
            <div className="p-4 border rounded-md space-y-2">
              <p className="text-sm">
                <span className="text-muted-foreground">Data:</span>{" "}
                <span className="font-medium">{targetTransaction?.date}</span>
              </p>
              <p className="text-sm">
                <span className="text-muted-foreground">Descrição:</span>{" "}
                <span className="font-medium">{targetTransaction?.description}</span>
              </p>
              <p className="text-sm">
                <span className="text-muted-foreground">Valor:</span>{" "}
                <span className="font-medium tabular-nums">
                  {targetTransaction && formatCurrency(targetTransaction.value)}
                </span>
              </p>
            </div>
          </div>

          <div className="p-4 bg-accent rounded-md">
            <p className="text-sm text-center">
              <span className="text-muted-foreground">Confiança do algoritmo:</span>{" "}
              <span className="font-semibold text-foreground">{confidence}%</span>
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleReject}
              data-testid="button-reject-match"
            >
              Rejeitar
            </Button>
            <Button
              className="flex-1"
              onClick={handleConfirmMatch}
              data-testid="button-confirm-match"
            >
              Confirmar Correspondência
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
