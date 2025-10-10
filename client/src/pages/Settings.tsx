import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export default function Settings() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold mb-2">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie as configurações do sistema de conciliação
        </p>
      </div>

      <div className="grid gap-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Configurações de Correspondência</CardTitle>
            <CardDescription>
              Ajuste os parâmetros do algoritmo de conciliação
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="date-tolerance">Tolerância de Data (dias)</Label>
              <Input
                id="date-tolerance"
                type="number"
                defaultValue="2"
                min="0"
                max="7"
                data-testid="input-date-tolerance"
              />
              <p className="text-xs text-muted-foreground">
                Margem de erro aceitável entre datas de transações (±dias)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confidence-threshold">Limite de Confiança (%)</Label>
              <Input
                id="confidence-threshold"
                type="number"
                defaultValue="80"
                min="50"
                max="100"
                data-testid="input-confidence-threshold"
              />
              <p className="text-xs text-muted-foreground">
                Porcentagem mínima de similaridade para correspondência automática
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Correspondência Automática</Label>
                <p className="text-xs text-muted-foreground">
                  Aprovar automaticamente correspondências com alta confiança
                </p>
              </div>
              <Switch defaultChecked data-testid="switch-auto-match" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notificações</CardTitle>
            <CardDescription>
              Configure as notificações do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notificar Novas Correspondências</Label>
                <p className="text-xs text-muted-foreground">
                  Receber alertas quando novas correspondências forem encontradas
                </p>
              </div>
              <Switch defaultChecked data-testid="switch-notify-matches" />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notificar Pendências</Label>
                <p className="text-xs text-muted-foreground">
                  Alertar sobre transações pendentes de conciliação
                </p>
              </div>
              <Switch defaultChecked data-testid="switch-notify-pending" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Exportação de Dados</CardTitle>
            <CardDescription>
              Configure as opções de exportação de relatórios
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="export-format">Formato de Exportação</Label>
              <select
                id="export-format"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                data-testid="select-export-format"
              >
                <option value="excel">Excel (.xlsx)</option>
                <option value="csv">CSV (.csv)</option>
                <option value="pdf">PDF (.pdf)</option>
              </select>
            </div>

            <Button className="w-full" data-testid="button-save-settings">
              Salvar Configurações
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
