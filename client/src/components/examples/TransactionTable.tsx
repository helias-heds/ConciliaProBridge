import { TransactionTable, Transaction } from "../TransactionTable";

//todo: remove mock functionality
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
    date: new Date("2024-01-17"),
    description: "Conta de Luz",
    value: 450.00,
    status: "pending-ledger",
  },
  {
    id: "4",
    date: new Date("2024-01-18"),
    description: "Taxa Bancária",
    value: 35.00,
    status: "pending-statement",
  },
];

export default function TransactionTableExample() {
  return (
    <div className="p-8">
      <TransactionTable transactions={mockTransactions} />
    </div>
  );
}
