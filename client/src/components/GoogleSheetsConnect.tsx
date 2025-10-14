import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiGooglesheets } from "react-icons/si";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Download, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";

export function GoogleSheetsConnect() {
  const [apiKey, setApiKey] = useState("");
  const [sheetUrl, setSheetUrl] = useState("");
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const { data: connection } = useQuery<any>({
    queryKey: ["/api/google-sheets/connection"],
  });

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
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ["/api/google-sheets/connection"] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: error.message || "Failed to connect to Google Sheets",
      });
    },
  });

  const importMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/google-sheets/import", {});
      return res.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "Import Info",
        description: data.message || "Import completed",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/google-sheets/connection"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Import Failed",
        description: error.message || "Failed to import from Google Sheets",
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

  const handleImport = () => {
    importMutation.mutate();
  };

  const isConnected = !!connection;

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
        {isConnected && !showForm ? (
          <>
            <div className="space-y-3 p-4 border rounded-md bg-accent/50">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-chart-2" />
                <span className="font-medium">Connected</span>
                <Badge variant="secondary" className="ml-auto">Active</Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Label className="text-xs text-muted-foreground min-w-24">Spreadsheet:</Label>
                  <div className="flex-1 flex items-center gap-2">
                    <span className="text-sm font-mono truncate">{connection.sheetUrl}</span>
                    <a 
                      href={connection.sheetUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
                
                {connection.lastImportDate && (
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-muted-foreground min-w-24">Last Import:</Label>
                    <span className="text-sm">
                      {format(new Date(connection.lastImportDate), "PPp", { locale: enUS })}
                    </span>
                  </div>
                )}
                
                {connection.lastImportCount !== null && connection.lastImportCount !== undefined && (
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-muted-foreground min-w-24">Records:</Label>
                    <span className="text-sm">{connection.lastImportCount} transactions</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleImport} 
                className="flex-1"
                disabled={importMutation.isPending}
                data-testid="button-import-sheets"
              >
                <Download className="h-4 w-4 mr-2" />
                {importMutation.isPending ? "Importing..." : "Import Now"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowForm(true)}
                data-testid="button-reconnect-sheets"
              >
                Reconnect
              </Button>
            </div>
          </>
        ) : (
          <>
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
            <div className="flex gap-2">
              <Button 
                onClick={handleConnect} 
                className="flex-1" 
                disabled={connectMutation.isPending}
                data-testid="button-connect-sheets"
              >
                {connectMutation.isPending ? "Connecting..." : "Connect Spreadsheet"}
              </Button>
              {isConnected && showForm && (
                <Button 
                  variant="outline" 
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
