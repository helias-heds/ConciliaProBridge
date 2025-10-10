import { FileUploadZone } from "../FileUploadZone";

export default function FileUploadZoneExample() {
  const handleFilesSelected = (files: FileList) => {
    console.log("Files selected:", Array.from(files).map(f => f.name));
  };

  return (
    <div className="p-8">
      <FileUploadZone
        onFilesSelected={handleFilesSelected}
        acceptedFormats={[".ofx", ".csv"]}
      />
    </div>
  );
}
