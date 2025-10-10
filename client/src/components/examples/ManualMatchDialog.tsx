import { ManualMatchDialog } from "../ManualMatchDialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";

//todo: remove mock functionality
const mockSource = {
  date: "15/01/2024",
  description: "Pagamento Fornecedor ABC Ltda",
  value: 1500.00,
  source: "Planilha de Lançamentos",
};

const mockTarget = {
  date: "16/01/2024",
  description: "PAG FORNEC ABC",
  value: 1500.00,
  source: "Extrato Bancário",
};

export default function ManualMatchDialogExample() {
  const [open, setOpen] = useState(false);

  return (
    <div className="p-8">
      <Button onClick={() => setOpen(true)}>Abrir Diálogo de Correspondência</Button>
      <ManualMatchDialog
        open={open}
        onOpenChange={setOpen}
        sourceTransaction={mockSource}
        targetTransaction={mockTarget}
        confidence={87}
      />
    </div>
  );
}
