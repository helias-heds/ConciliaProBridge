import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { useState } from "react";

interface AddTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd?: (transaction: NewTransaction) => void;
}

export interface NewTransaction {
  date: Date;
  name: string;
  car: string;
  value: number;
  type: "income" | "expense";
  source: "manual";
}

export function AddTransactionDialog({ open, onOpenChange, onAdd }: AddTransactionDialogProps) {
  const [date, setDate] = useState<Date>(new Date());
  const [name, setName] = useState("");
  const [car, setCar] = useState("");
  const [value, setValue] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");

  const handleAdd = () => {
    if (!name || !value) {
      console.log("Missing required fields");
      return;
    }

    const transaction: NewTransaction = {
      date,
      name,
      car,
      value: parseFloat(value),
      type,
      source: "manual",
    };

    console.log("Adding new transaction:", transaction);
    onAdd?.(transaction);
    
    // Reset form
    setName("");
    setCar("");
    setValue("");
    setType("expense");
    setDate(new Date());
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Manual Transaction</DialogTitle>
          <DialogDescription>
            Create a new transaction not found in ledger or statements
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="transaction-type">Transaction Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as "income" | "expense")}>
              <SelectTrigger id="transaction-type" data-testid="select-transaction-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expense">Expense (Outflow)</SelectItem>
                <SelectItem value="income">Income (Inflow)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  data-testid="button-select-date"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(date, "MMMM dd, yyyy", { locale: enUS })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  locale={enUS}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Ex: Vendor payment"
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-testid="input-name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="car">Car (Optional)</Label>
            <Input
              id="car"
              placeholder="Ex: Honda Civic 2020"
              value={car}
              onChange={(e) => setCar(e.target.value)}
              data-testid="input-car"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="value">Amount (USD)</Label>
            <Input
              id="value"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              data-testid="input-value"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            data-testid="button-cancel"
          >
            Cancel
          </Button>
          <Button onClick={handleAdd} data-testid="button-add-transaction">
            Add Transaction
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
