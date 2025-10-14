import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUploadZone } from "@/components/FileUploadZone";
import { GoogleSheetsConnect } from "@/components/GoogleSheetsConnect";
import { Separator } from "@/components/ui/separator";
import { FileText, CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Progress } from "@/components/ui/progress";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  status: "uploading" | "success" | "error";
  message?: string;
}

export default function Upload() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (files: FileList) => {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("files", file);
      });

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

  const handleFilesSelected = (files: FileList) => {
    const newFiles = Array.from(files).map((file, index) => ({
      id: `${Date.now()}-${index}`,
      name: file.name,
      size: file.size,
      status: "uploading" as const,
    }));

    setUploadedFiles((prev) => [...prev, ...newFiles]);
    uploadMutation.mutate(files);
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
            <CardTitle>Statement Upload</CardTitle>
            <CardDescription>
              Upload bank and credit card statements (.ofx, .csv)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileUploadZone
              onFilesSelected={handleFilesSelected}
              acceptedFormats={[".ofx", ".csv"]}
            />
            {uploadMutation.isPending && (
              <div className="mt-4 space-y-2">
                <p className="text-sm text-muted-foreground">Processing files...</p>
                <Progress value={undefined} className="w-full" />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

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
