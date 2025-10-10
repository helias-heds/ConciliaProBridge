import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Account {
  id: string;
  name: string;
  type: string;
}

interface AccountSelectorProps {
  accounts: Account[];
  onAccountChange?: (accountId: string) => void;
}

export function AccountSelector({ accounts, onAccountChange }: AccountSelectorProps) {
  return (
    <Select onValueChange={onAccountChange} defaultValue={accounts[0]?.id}>
      <SelectTrigger className="w-64" data-testid="select-account">
        <SelectValue placeholder="Selecione a conta" />
      </SelectTrigger>
      <SelectContent>
        {accounts.map((account) => (
          <SelectItem key={account.id} value={account.id}>
            {account.name} - {account.type}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
