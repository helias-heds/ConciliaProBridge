import { useState } from "react";
import { StatusCard } from "@/components/StatusCard";
import { TransactionTable, Transaction } from "@/components/TransactionTable";
import { TransactionSheet } from "@/components/TransactionSheet";
import { TrashView } from "@/components/TrashView";
import { DateRangePicker } from "@/components/DateRangePicker";
import { AccountSelector } from "@/components/AccountSelector";
import { ManualMatchDialog } from "@/components/ManualMatchDialog";
import { AddTransactionDialog, NewTransaction } from "@/components/AddTransactionDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Clock, AlertCircle, Plus, Trash2, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DateRange } from "react-day-picker";
import { isWithinInterval } from "date-fns";

//todo: remove mock functionality
const mockAccounts = [
  { id: "1", name: "Checking Account", type: "Bank of America" },
  { id: "2", name: "Savings Account", type: "Wells Fargo" },
  { id: "3", name: "Corporate Card", type: "Visa" },
];

const mockTransactions: Transaction[] = [
  {
    id: "1",
    date: new Date("2024-01-15"),
    name: "Payment Receipt - John Smith",
    car: "Honda Civic 2020",
    value: 1500.00,
    status: "reconciled",
    confidence: 98,
  },
  {
    id: "2",
    date: new Date("2024-01-16"),
    name: "Payment Receipt - Mary Johnson",
    car: "Toyota Corolla 2021",
    value: 3200.50,
    status: "reconciled",
    confidence: 95,
  },
  {
    id: "3",
    date: new Date("2024-01-14"),
    name: "Payment Receipt - Robert Williams",
    car: "Chevrolet Malibu 2022",
    value: 2500.00,
    status: "reconciled",
    confidence: 100,
  },
  {
    id: "4",
    date: new Date("2024-01-17"),
    name: "Payment Receipt - Jennifer Davis",
    car: "Ford Escape 2023",
    value: 450.00,
    status: "pending-ledger",
  },
  {
    id: "5",
    date: new Date("2024-01-17"),
    name: "Payment Receipt - Michael Brown",
    car: "Volkswagen Jetta 2022",
    value: 890.00,
    status: "pending-ledger",
  },
  {
    id: "6",
    date: new Date("2024-01-18"),
    name: "Bank Fee",
    car: "",
    value: 35.00,
    status: "pending-statement",
  },
  {
    id: "7",
    date: new Date("2024-01-19"),
    name: "Payment Receipt - Sarah Martinez",
    car: "Hyundai Elantra 2021",
    value: 1250.00,
    status: "pending-statement",
  },
];

export default function Dashboard() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [trashedTransactions, setTrashedTransactions] = useState<Array<Transaction & { deletedAt: Date }>>([]);
  
  // Temporary filters (selected but not applied)
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange | undefined>(undefined);
  
  // Applied filters (in use for filtering)
  const [appliedDateRange, setAppliedDateRange] = useState<DateRange | undefined>(undefined);
  
  // Check if there are pending filters to apply
  const hasUnappliedFilters = JSON.stringify(selectedDateRange) !== JSON.stringify(appliedDateRange);

  // Apply account and date filters to transactions
  const getBaseFilteredTransactions = () => {
    let filtered = transactions;
    
    // Date filter (if applied)
    if (appliedDateRange?.from && appliedDateRange?.to) {
      const startDate = appliedDateRange.from;
      const endDate = appliedDateRange.to;
      
      filtered = filtered.filter(t =>
        isWithinInterval(t.date, { 
          start: startDate, 
          end: endDate 
        })
      );
    }
    
    return filtered;
  };

  const baseFiltered = getBaseFilteredTransactions();
  const reconciledTransactions = baseFiltered.filter(t => t.status === "reconciled");
  const pendingLedger = baseFiltered.filter(t => t.status === "pending-ledger");
  const pendingStatement = baseFiltered.filter(t => t.status === "pending-statement");

  const handleAddTransaction = (newTransaction: NewTransaction) => {
    const transaction: Transaction = {
      id: `manual-${Date.now()}`,
      date: newTransaction.date,
      name: newTransaction.name,
      car: newTransaction.car,
      value: newTransaction.value,
      status: "pending-ledger",
    };
    setTransactions(prev => [...prev, transaction]);
  };

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setSheetOpen(true);
  };

  const handleUpdateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions(prev =>
      prev.map(t =>
        t.id === id ? { ...t, ...updates } : t
      )
    );
  };

  const handleDeleteTransaction = (id: string) => {
    const transaction = transactions.find(t => t.id === id);
    if (transaction) {
      // Move to trash with deletion timestamp
      setTrashedTransactions(prev => [...prev, { ...transaction, deletedAt: new Date() }]);
      // Remove from active transactions
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleApplyFilters = () => {
    setAppliedDateRange(selectedDateRange);
  };

  const getFilteredTransactions = () => {
    switch (activeTab) {
      case "reconciled":
        return reconciledTransactions;
      case "pending-ledger":
        return pendingLedger;
      case "pending-statement":
        return pendingStatement;
      default:
        return baseFiltered;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold mb-2">Reconciliation Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of transactions and reconciliation status
        </p>
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <AccountSelector 
          accounts={mockAccounts}
        />
        <DateRangePicker 
          value={selectedDateRange}
          onDateChange={setSelectedDateRange}
        />
        <Button 
          variant={hasUnappliedFilters ? "default" : "outline"}
          onClick={handleApplyFilters} 
          data-testid="button-apply-filters"
          className="relative"
        >
          <Filter className="h-4 w-4 mr-2" />
          Apply Filters
          {hasUnappliedFilters && (
            <Badge 
              variant="destructive" 
              className="ml-2 h-5 px-1.5"
            >
              !
            </Badge>
          )}
        </Button>
        {appliedDateRange && (
          <Button 
            variant="ghost"
            onClick={() => {
              setSelectedDateRange(undefined);
              setAppliedDateRange(undefined);
            }}
            data-testid="button-clear-filters"
          >
            Clear Filters
          </Button>
        )}
        <Button variant="outline" onClick={() => setDialogOpen(true)} data-testid="button-manual-match">
          Manual Match
        </Button>
        <Button onClick={() => setAddDialogOpen(true)} data-testid="button-add-transaction">
          <Plus className="h-4 w-4 mr-2" />
          New Transaction
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatusCard
          title="Reconciled"
          value={reconciledTransactions.length}
          total={baseFiltered.length}
          icon={CheckCircle2}
          variant="success"
        />
        <StatusCard
          title="Pending Ledger"
          value={pendingLedger.length}
          total={baseFiltered.length}
          icon={Clock}
          variant="warning"
        />
        <StatusCard
          title="Pending Statement"
          value={pendingStatement.length}
          total={baseFiltered.length}
          icon={AlertCircle}
          variant="error"
        />
        <StatusCard
          title="Trash"
          value={trashedTransactions.length}
          icon={Trash2}
          variant="default"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all" data-testid="tab-all">
            All ({baseFiltered.length})
          </TabsTrigger>
          <TabsTrigger value="reconciled" data-testid="tab-reconciled">
            Reconciled ({reconciledTransactions.length})
          </TabsTrigger>
          <TabsTrigger value="pending-ledger" data-testid="tab-pending-ledger">
            Pending Ledger ({pendingLedger.length})
          </TabsTrigger>
          <TabsTrigger value="pending-statement" data-testid="tab-pending-statement">
            Pending Statement ({pendingStatement.length})
          </TabsTrigger>
          <TabsTrigger value="trash" data-testid="tab-trash">
            Trash ({trashedTransactions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {activeTab === "trash" ? (
            <TrashView 
              trashedTransactions={trashedTransactions}
              onRestore={(id) => {
                const trashed = trashedTransactions.find(t => t.id === id);
                if (trashed) {
                  const { deletedAt, ...transaction } = trashed;
                  setTransactions(prev => [...prev, transaction]);
                  setTrashedTransactions(prev => prev.filter(t => t.id !== id));
                }
              }}
              onPermanentDelete={(id) => {
                setTrashedTransactions(prev => prev.filter(t => t.id !== id));
              }}
            />
          ) : (
            <TransactionTable 
              transactions={getFilteredTransactions()} 
              onTransactionClick={handleTransactionClick}
            />
          )}
        </TabsContent>
      </Tabs>

      <ManualMatchDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        sourceTransaction={{
          date: "01/15/2024",
          description: "Vendor Payment ABC Corp",
          value: 1500.00,
          source: "Ledger Spreadsheet",
        }}
        targetTransaction={{
          date: "01/16/2024",
          description: "PMT VENDOR ABC",
          value: 1500.00,
          source: "Bank Statement",
        }}
        confidence={87}
      />

      <AddTransactionDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onAdd={handleAddTransaction}
      />

      <TransactionSheet
        transaction={selectedTransaction}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onUpdate={handleUpdateTransaction}
        onDelete={handleDeleteTransaction}
      />
    </div>
  );
}
