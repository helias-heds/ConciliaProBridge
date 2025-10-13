import { Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface FileUploadZoneProps {
  onFilesSelected?: (files: FileList) => void;
  acceptedFormats: string[];
}

export function FileUploadZone({ onFilesSelected, acceptedFormats }: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (onFilesSelected && e.dataTransfer.files) {
      onFilesSelected(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onFilesSelected && e.target.files) {
      onFilesSelected(e.target.files);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-md min-h-32 flex flex-col items-center justify-center p-6 transition-colors ${
        isDragging ? "border-primary bg-accent" : "border-border"
      }`}
      data-testid="zone-file-upload"
    >
      <Upload className="h-10 w-10 text-muted-foreground mb-4" />
      <p className="text-sm text-center text-muted-foreground mb-2">
        Drag files here or click to select
      </p>
      <input
        type="file"
        multiple
        accept={acceptedFormats.join(",")}
        onChange={handleFileInput}
        className="hidden"
        id="file-input"
        data-testid="input-file"
      />
      <label
        htmlFor="file-input"
        className="text-sm font-medium text-primary cursor-pointer hover:underline"
      >
        Select files
      </label>
      <div className="flex gap-2 mt-4 flex-wrap justify-center">
        {acceptedFormats.map((format) => (
          <Badge key={format} variant="secondary">
            {format}
          </Badge>
        ))}
      </div>
    </div>
  );
}
