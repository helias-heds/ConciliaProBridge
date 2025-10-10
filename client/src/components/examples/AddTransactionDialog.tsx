import { AddTransactionDialog } from "../AddTransactionDialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function AddTransactionDialogExample() {
  const [open, setOpen] = useState(false);

  return (
    <div className="p-8">
      <Button onClick={() => setOpen(true)}>Abrir Diálogo de Adição</Button>
      <AddTransactionDialog
        open={open}
        onOpenChange={setOpen}
        onAdd={(transaction) => console.log("New transaction:", transaction)}
      />
    </div>
  );
}
