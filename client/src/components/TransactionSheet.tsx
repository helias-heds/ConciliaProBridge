import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Clock, AlertCircle, Trash2, Save } from "lucide-react";
import { format } from "date-fns";

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

interface TransactionSheetProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (id: string, updates: Partial<Transaction>) => void;
  onDelete: (id: string) => void;
}

export function TransactionSheet({
  transaction,
  open,
  onOpenChange,
  onUpdate,
  onDelete,
}: TransactionSheetProps) {
  const [name, setName] = useState(transaction?.name || "");
  const [car, setCar] = useState(transaction?.car || "");
  const [depositor, setDepositor] = useState(transaction?.depositor || "");
  const [date, setDate] = useState(
    transaction?.date ? format(transaction.date, "yyyy-MM-dd") : ""
  );
  const [value, setValue] = useState(transaction?.value.toString() || "");
  const [status, setStatus] = useState<Transaction["status"]>(
    transaction?.status || "pending-ledger"
  );

  // Update local state when transaction changes
  if (transaction && transaction.id !== (transaction as any)._lastId) {
    setName(transaction.name);
    setCar(transaction.car);
    setDepositor(transaction.depositor || "");
    setDate(format(transaction.date, "yyyy-MM-dd"));
    setValue(transaction.value.toString());
    setStatus(transaction.status);
    (transaction as any)._lastId = transaction.id;
  }

  const handleSave = () => {
    if (!transaction) return;

    onUpdate(transaction.id, {
      name,
      car,
      depositor: depositor || undefined,
      date: new Date(date),
      value: parseFloat(value),
      status,
    });
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (!transaction) return;
    
    if (confirm("Are you sure you want to move this transaction to trash?")) {
      onDelete(transaction.id);
      onOpenChange(false);
    }
  };

  const getStatusInfo = (status: Transaction["status"]) => {
    const statusMap = {
      reconciled: {
        label: "Reconciled",
        icon: CheckCircle2,
        color: "text-chart-2",
      },
      "pending-ledger": {
        label: "Pending Ledger",
        icon: Clock,
        color: "text-chart-3",
      },
      "pending-statement": {
        label: "Pending Statement",
        icon: AlertCircle,
        color: "text-chart-4",
      },
    };
    return statusMap[status];
  };

  if (!transaction) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]" data-testid="sheet-transaction-edit">
        <SheetHeader>
          <SheetTitle>Edit Transaction</SheetTitle>
          <SheetDescription>
            Update transaction details or move to trash.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter transaction name"
              data-testid="input-edit-name"
            />
          </div>

          {/* Car */}
          <div className="space-y-2">
            <Label htmlFor="car">Car (Optional)</Label>
            <Input
              id="car"
              value={car}
              onChange={(e) => setCar(e.target.value)}
              placeholder="Ex: Honda Civic 2020"
              data-testid="input-edit-car"
            />
          </div>

          {/* Depositor */}
          <div className="space-y-2">
            <Label htmlFor="depositor">Depositor (Optional)</Label>
            <Input
              id="depositor"
              value={depositor}
              onChange={(e) => setDepositor(e.target.value)}
              placeholder="Ex: John Smith"
              data-testid="input-edit-depositor"
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              data-testid="input-edit-date"
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="value">Amount (USD)</Label>
            <Input
              id="value"
              type="number"
              step="0.01"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="0.00"
              data-testid="input-edit-value"
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(val) => setStatus(val as Transaction["status"])}>
              <SelectTrigger data-testid="select-edit-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(["reconciled", "pending-ledger", "pending-statement"] as const).map((s) => {
                  const info = getStatusInfo(s);
                  const Icon = info.icon;
                  return (
                    <SelectItem key={s} value={s} data-testid={`status-option-${s}`}>
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${info.color}`} />
                        {info.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={handleSave}
              className="w-full"
              data-testid="button-save-transaction"
            >
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>

            <Button
              variant="destructive"
              onClick={handleDelete}
              className="w-full"
              data-testid="button-delete-transaction"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Move to Trash
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Trash items are kept for 15 days before being permanently deleted.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
