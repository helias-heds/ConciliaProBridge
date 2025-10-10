import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiGooglesheets } from "react-icons/si";
import { useState } from "react";

export function GoogleSheetsConnect() {
  const [apiKey, setApiKey] = useState("");
  const [sheetUrl, setSheetUrl] = useState("");

  const handleConnect = () => {
    console.log("Connecting to Google Sheets with:", { apiKey, sheetUrl });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <SiGooglesheets className="h-6 w-6 text-chart-2" />
          <CardTitle>Conectar Google Sheets</CardTitle>
        </div>
        <CardDescription>
          Conecte sua planilha de lançamentos para sincronização automática
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="api-key">Chave API do Google</Label>
          <Input
            id="api-key"
            type="password"
            placeholder="Cole sua chave API aqui"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            data-testid="input-api-key"
          />
          <p className="text-xs text-muted-foreground">
            Obtenha sua chave API no Google Cloud Console
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="sheet-url">URL da Planilha</Label>
          <Input
            id="sheet-url"
            type="url"
            placeholder="https://docs.google.com/spreadsheets/d/..."
            value={sheetUrl}
            onChange={(e) => setSheetUrl(e.target.value)}
            data-testid="input-sheet-url"
          />
        </div>
        <Button onClick={handleConnect} className="w-full" data-testid="button-connect-sheets">
          Conectar Planilha
        </Button>
      </CardContent>
    </Card>
  );
}
