import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUploadZone } from "@/components/FileUploadZone";
import { GoogleSheetsConnect } from "@/components/GoogleSheetsConnect";
import { Separator } from "@/components/ui/separator";
import { FileText, CheckCircle, XCircle, ArrowLeftRight } from "lucide-react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  status: "uploading" | "success" | "error";
  message?: string;
}

export default function Upload() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [bankFiles, setBankFiles] = useState<UploadedFile[]>([]);
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async ({ files, type }: { files: FileList; type: 'stripe' | 'bank' }) => {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("files", file);
      });
      formData.append("type", type);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Upload failed");
      }

      return res.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "Upload Successful",
        description: data.message || `Imported ${data.count} transactions`,
      });
      
      setUploadedFiles((prev) =>
        prev.map((file) =>
          file.status === "uploading"
            ? { ...file, status: "success", message: "Processed successfully" }
            : file
        )
      );

      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error.message || "Failed to process files",
      });

      setUploadedFiles((prev) =>
        prev.map((file) =>
          file.status === "uploading"
            ? { ...file, status: "error", message: error.message }
            : file
        )
      );
    },
  });

  const reconcileMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/reconcile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Reconciliation failed");
      }

      return res.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "Reconciliation Complete",
        description: `${data.matches} matches found. ${data.unmatchedCsv} CSV and ${data.unmatchedSheets} Google Sheets transactions remain unmatched.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Reconciliation Failed",
        description: error.message || "Failed to reconcile transactions",
      });
    },
  });

  const handleFilesSelected = (files: FileList, type: 'stripe' | 'bank') => {
    const newFiles = Array.from(files).map((file, index) => ({
      id: `${Date.now()}-${index}`,
      name: file.name,
      size: file.size,
      status: "uploading" as const,
    }));

    if (type === 'stripe') {
      setUploadedFiles((prev) => [...prev, ...newFiles]);
    } else {
      setBankFiles((prev) => [...prev, ...newFiles]);
    }
    uploadMutation.mutate({ files, type });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getStatusIcon = (status: UploadedFile["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-chart-2" />;
      case "error":
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return <FileText className="h-5 w-5 text-muted-foreground animate-pulse" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold mb-2">File Upload</h1>
        <p className="text-muted-foreground">
          Connect your spreadsheet and import bank and card statements
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GoogleSheetsConnect />

        <Card>
          <CardHeader>
            <CardTitle>Statement Upload (Stripe)</CardTitle>
            <CardDescription>
              Upload credit card statements from Stripe (.csv)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileUploadZone
              onFilesSelected={(files) => handleFilesSelected(files, 'stripe')}
              acceptedFormats={[".csv"]}
            />
            {uploadMutation.isPending && (
              <div className="mt-4 space-y-2">
                <p className="text-sm text-muted-foreground">Processing Stripe files...</p>
                <Progress value={undefined} className="w-full" />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Bank CSV (Wells Fargo)</CardTitle>
            <CardDescription>
              Upload bank statements from Wells Fargo (.csv, .ofx)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileUploadZone
              onFilesSelected={(files) => handleFilesSelected(files, 'bank')}
              acceptedFormats={[".ofx", ".csv"]}
            />
            {uploadMutation.isPending && (
              <div className="mt-4 space-y-2">
                <p className="text-sm text-muted-foreground">Processing bank files...</p>
                <Progress value={undefined} className="w-full" />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5" />
            Reconciliation
          </CardTitle>
          <CardDescription>
            Match CSV transactions with Google Sheets ledger data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              The system will automatically match transactions by comparing:
            </p>
            <ul className="text-sm space-y-2 text-muted-foreground list-disc list-inside">
              <li>Date (±2 days tolerance)</li>
              <li>Payment method (e.g., Zelle)</li>
              <li>Customer/Depositor name (text after "from")</li>
              <li>Transaction amount</li>
            </ul>
            <Button
              onClick={() => reconcileMutation.mutate()}
              disabled={reconcileMutation.isPending}
              className="w-full sm:w-auto"
              data-testid="button-reconcile"
            >
              {reconcileMutation.isPending ? "Reconciling..." : "Start Reconciliation"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {uploadedFiles.length > 0 && (
        <>
          <Separator />
          <div>
            <h2 className="text-xl font-semibold mb-4">Upload History</h2>
            <div className="space-y-2">
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-4 border rounded-md hover-elevate"
                  data-testid={`file-item-${file.id}`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    {getStatusIcon(file.status)}
                    <div className="flex-1">
                      <p className="font-medium">{file.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{formatFileSize(file.size)}</span>
                        {file.message && (
                          <>
                            <span>•</span>
                            <span>{file.message}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
