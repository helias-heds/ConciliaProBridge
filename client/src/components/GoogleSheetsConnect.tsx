import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiGooglesheets } from "react-icons/si";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function GoogleSheetsConnect() {
  const [apiKey, setApiKey] = useState("");
  const [sheetUrl, setSheetUrl] = useState("");
  const { toast } = useToast();

  const connectMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/google-sheets/connect", { apiKey, sheetUrl });
      return res.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "Connection Successful",
        description: data.message || "Google Sheets connected successfully",
      });
      setApiKey("");
      setSheetUrl("");
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: error.message || "Failed to connect to Google Sheets",
      });
    },
  });

  const handleConnect = () => {
    if (!apiKey || !sheetUrl) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please provide both API key and spreadsheet URL",
      });
      return;
    }
    connectMutation.mutate();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <SiGooglesheets className="h-6 w-6 text-chart-2" />
          <CardTitle>Connect Google Sheets</CardTitle>
        </div>
        <CardDescription>
          Connect your ledger spreadsheet for automatic synchronization
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="api-key">Google API Key</Label>
          <Input
            id="api-key"
            type="password"
            placeholder="Paste your API key here"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            disabled={connectMutation.isPending}
            data-testid="input-api-key"
          />
          <p className="text-xs text-muted-foreground">
            Get your API key from Google Cloud Console
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="sheet-url">Spreadsheet URL</Label>
          <Input
            id="sheet-url"
            type="url"
            placeholder="https://docs.google.com/spreadsheets/d/..."
            value={sheetUrl}
            onChange={(e) => setSheetUrl(e.target.value)}
            disabled={connectMutation.isPending}
            data-testid="input-sheet-url"
          />
        </div>
        <Button 
          onClick={handleConnect} 
          className="w-full" 
          disabled={connectMutation.isPending}
          data-testid="button-connect-sheets"
        >
          {connectMutation.isPending ? "Connecting..." : "Connect Spreadsheet"}
        </Button>
      </CardContent>
    </Card>
  );
}
