import { AccountSelector } from "../AccountSelector";

//todo: remove mock functionality
const mockAccounts = [
  { id: "1", name: "Conta Corrente", type: "Banco do Brasil" },
  { id: "2", name: "Conta Poupança", type: "Caixa Econômica" },
  { id: "3", name: "Cartão Corporativo", type: "Visa" },
];

export default function AccountSelectorExample() {
  return (
    <div className="p-8">
      <AccountSelector
        accounts={mockAccounts}
        onAccountChange={(id) => console.log("Account changed:", id)}
      />
    </div>
  );
}
