import { useState } from "react";
import { StatusCard } from "@/components/StatusCard";
import { TransactionTable, Transaction } from "@/components/TransactionTable";
import { TransactionSheet } from "@/components/TransactionSheet";
import { TrashView } from "@/components/TrashView";
import { DateRangePicker } from "@/components/DateRangePicker";
import { ManualMatchDialog } from "@/components/ManualMatchDialog";
import { AddTransactionDialog, NewTransaction } from "@/components/AddTransactionDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Clock, AlertCircle, Plus, Trash2, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DateRange } from "react-day-picker";
import { isWithinInterval } from "date-fns";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [trashedTransactions, setTrashedTransactions] = useState<Array<Transaction & { deletedAt: Date }>>([]);
  
  // Temporary filters (selected but not applied)
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange | undefined>(undefined);
  
  // Applied filters (in use for filtering)
  const [appliedDateRange, setAppliedDateRange] = useState<DateRange | undefined>(undefined);
  
  // Check if there are pending filters to apply
  const hasUnappliedFilters = JSON.stringify(selectedDateRange) !== JSON.stringify(appliedDateRange);

  // Fetch transactions from API
  const { data: apiTransactions, isLoading } = useQuery<any[]>({
    queryKey: ["/api/transactions"],
  });

  // Convert API data to Transaction format with Date objects
  const transactions: Transaction[] = (apiTransactions || []).map(t => ({
    ...t,
    date: new Date(t.date),
    value: parseFloat(t.value),
  }));

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

  // Mutation for creating transactions
  const createMutation = useMutation({
    mutationFn: async (newTransaction: NewTransaction) => {
      const res = await apiRequest("POST", "/api/transactions", {
        date: newTransaction.date.toISOString(),
        name: newTransaction.name,
        value: newTransaction.value.toString(),
        status: "pending-ledger",
        source: "Manual Entry",
        car: newTransaction.car || null,
        confidence: null,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      toast({
        title: "Transaction Added",
        description: "Transaction added successfully",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add transaction",
      });
    },
  });

  // Mutation for updating transactions
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Transaction> }) => {
      const res = await apiRequest("PATCH", `/api/transactions/${id}`, {
        ...updates,
        date: updates.date?.toISOString(),
        value: updates.value?.toString(),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      toast({
        title: "Transaction Updated",
        description: "Transaction updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update transaction",
      });
    },
  });

  // Mutation for deleting transactions
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/transactions/${id}`, {});
      // DELETE returns 204 No Content, no need to parse JSON
      if (res.status === 204) {
        return null;
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      toast({
        title: "Transaction Deleted",
        description: "Transaction moved to trash",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete transaction",
      });
    },
  });

  const handleAddTransaction = (newTransaction: NewTransaction) => {
    createMutation.mutate(newTransaction);
  };

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setSheetOpen(true);
  };

  const handleUpdateTransaction = (id: string, updates: Partial<Transaction>) => {
    updateMutation.mutate({ id, updates });
  };

  const handleDeleteTransaction = (id: string) => {
    const transaction = transactions.find(t => t.id === id);
    if (transaction) {
      setTrashedTransactions(prev => [...prev, { ...transaction, deletedAt: new Date() }]);
      deleteMutation.mutate(id);
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
          {isLoading ? (
            <div className="space-y-4">
              <div className="h-12 bg-muted animate-pulse rounded" />
              <div className="h-12 bg-muted animate-pulse rounded" />
              <div className="h-12 bg-muted animate-pulse rounded" />
              <div className="h-12 bg-muted animate-pulse rounded" />
              <div className="h-12 bg-muted animate-pulse rounded" />
            </div>
          ) : activeTab === "trash" ? (
            <TrashView 
              trashedTransactions={trashedTransactions}
              onRestore={(id) => {
                // Remove from local trash - transaction will reappear on next query refresh
                setTrashedTransactions(prev => prev.filter(t => t.id !== id));
                queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
              }}
              onPermanentDelete={(id) => {
                setTrashedTransactions(prev => prev.filter(t => t.id !== id));
              }}
            />
          ) : getFilteredTransactions().length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg font-medium">No transactions found</p>
              <p className="text-sm mt-2">Import data or add transactions to get started</p>
            </div>
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
