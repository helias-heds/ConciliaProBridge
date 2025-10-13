import { FileUploadZone } from "@/components/FileUploadZone";
import { GoogleSheetsConnect } from "@/components/GoogleSheetsConnect";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { FileText, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
}

export default function Upload() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const handleFilesSelected = (files: FileList) => {
    const newFiles = Array.from(files).map((file, index) => ({
      id: `${Date.now()}-${index}`,
      name: file.name,
      type: file.type,
      size: file.size,
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
    console.log("Files uploaded:", newFiles);
  };

  const handleRemoveFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
    console.log("File removed:", id);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
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
              Upload bank and credit card statements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileUploadZone
              onFilesSelected={handleFilesSelected}
              acceptedFormats={[".ofx", ".csv"]}
            />
          </CardContent>
        </Card>
      </div>

      {uploadedFiles.length > 0 && (
        <>
          <Separator />
          <div>
            <h2 className="text-xl font-semibold mb-4">Uploaded Files</h2>
            <div className="space-y-2">
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-4 border rounded-md hover-elevate"
                  data-testid={`file-item-${file.id}`}
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {file.name.endsWith('.ofx') ? 'OFX' : 'CSV'}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveFile(file.id)}
                      data-testid={`button-remove-${file.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
