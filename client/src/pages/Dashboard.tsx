import { useState } from "react";
import { StatusCard } from "@/components/StatusCard";
import { TransactionTable, Transaction } from "@/components/TransactionTable";
import { DateRangePicker } from "@/components/DateRangePicker";
import { AccountSelector } from "@/components/AccountSelector";
import { ManualMatchDialog } from "@/components/ManualMatchDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

//todo: remove mock functionality
const mockAccounts = [
  { id: "1", name: "Conta Corrente", type: "Banco do Brasil" },
  { id: "2", name: "Conta Poupança", type: "Caixa Econômica" },
  { id: "3", name: "Cartão Corporativo", type: "Visa" },
];

const mockTransactions: Transaction[] = [
  {
    id: "1",
    date: new Date("2024-01-15"),
    description: "Pagamento Fornecedor ABC",
    value: 1500.00,
    status: "reconciled",
    confidence: 98,
  },
  {
    id: "2",
    date: new Date("2024-01-16"),
    description: "Recebimento Cliente XYZ",
    value: 3200.50,
    status: "reconciled",
    confidence: 95,
  },
  {
    id: "3",
    date: new Date("2024-01-14"),
    description: "Aluguel Escritório",
    value: 2500.00,
    status: "reconciled",
    confidence: 100,
  },
  {
    id: "4",
    date: new Date("2024-01-17"),
    description: "Conta de Luz",
    value: 450.00,
    status: "pending-ledger",
  },
  {
    id: "5",
    date: new Date("2024-01-17"),
    description: "Manutenção Equipamentos",
    value: 890.00,
    status: "pending-ledger",
  },
  {
    id: "6",
    date: new Date("2024-01-18"),
    description: "Taxa Bancária",
    value: 35.00,
    status: "pending-statement",
  },
  {
    id: "7",
    date: new Date("2024-01-19"),
    description: "Tarifa de Manutenção",
    value: 25.00,
    status: "pending-statement",
  },
];

export default function Dashboard() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const reconciledTransactions = mockTransactions.filter(t => t.status === "reconciled");
  const pendingLedger = mockTransactions.filter(t => t.status === "pending-ledger");
  const pendingStatement = mockTransactions.filter(t => t.status === "pending-statement");

  const getFilteredTransactions = () => {
    switch (activeTab) {
      case "reconciled":
        return reconciledTransactions;
      case "pending-ledger":
        return pendingLedger;
      case "pending-statement":
        return pendingStatement;
      default:
        return mockTransactions;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold mb-2">Dashboard de Conciliação</h1>
        <p className="text-muted-foreground">
          Visão geral das transações e status de conciliação
        </p>
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <AccountSelector accounts={mockAccounts} />
        <DateRangePicker />
        <Button variant="outline" onClick={() => setDialogOpen(true)} data-testid="button-manual-match">
          Correspondência Manual
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatusCard
          title="Conciliados"
          value={reconciledTransactions.length}
          total={mockTransactions.length}
          icon={CheckCircle2}
          variant="success"
        />
        <StatusCard
          title="Pendentes na Planilha"
          value={pendingLedger.length}
          total={mockTransactions.length}
          icon={Clock}
          variant="warning"
        />
        <StatusCard
          title="Pendentes no Extrato"
          value={pendingStatement.length}
          total={mockTransactions.length}
          icon={AlertCircle}
          variant="error"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all" data-testid="tab-all">
            Todas ({mockTransactions.length})
          </TabsTrigger>
          <TabsTrigger value="reconciled" data-testid="tab-reconciled">
            Conciliadas ({reconciledTransactions.length})
          </TabsTrigger>
          <TabsTrigger value="pending-ledger" data-testid="tab-pending-ledger">
            Pendentes Planilha ({pendingLedger.length})
          </TabsTrigger>
          <TabsTrigger value="pending-statement" data-testid="tab-pending-statement">
            Pendentes Extrato ({pendingStatement.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <TransactionTable transactions={getFilteredTransactions()} />
        </TabsContent>
      </Tabs>

      <ManualMatchDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        sourceTransaction={{
          date: "15/01/2024",
          description: "Pagamento Fornecedor ABC Ltda",
          value: 1500.00,
          source: "Planilha de Lançamentos",
        }}
        targetTransaction={{
          date: "16/01/2024",
          description: "PAG FORNEC ABC",
          value: 1500.00,
          source: "Extrato Bancário",
        }}
        confidence={87}
      />
    </div>
  );
}
