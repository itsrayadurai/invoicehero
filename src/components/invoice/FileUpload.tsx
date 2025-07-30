import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Upload, X, FileText, Image, FileCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onClose: () => void;
  onDataExtracted: (data: any) => void;
}

export const FileUpload = ({ onClose, onDataExtracted }: FileUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const acceptedTypes = {
    'application/pdf': '.pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'text/plain': '.txt',
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif'
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="h-8 w-8 text-blue-500" />;
    } else if (file.type === 'application/pdf') {
      return <FileText className="h-8 w-8 text-red-500" />;
    } else {
      return <FileCheck className="h-8 w-8 text-green-500" />;
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(20);

    try {
      // Simulate file processing with mock data
      setProgress(50);
      
      // Mock extracted data based on file type
      await new Promise(resolve => setTimeout(resolve, 2000));
      setProgress(80);

      const mockExtractedData = {
        lineItems: [
          {
            id: Date.now().toString(),
            name: `Service from ${file.name}`,
            quantity: 1,
            rate: 100,
            total: 100
          },
          {
            id: (Date.now() + 1).toString(),
            name: "Consultation",
            quantity: 2,
            rate: 75,
            total: 150
          }
        ]
      };

      setProgress(100);
      
      toast({
        title: "File processed successfully",
        description: "Invoice data has been extracted and added to your invoice.",
      });

      onDataExtracted(mockExtractedData);
    } catch (error) {
      toast({
        title: "Processing failed",
        description: "Unable to extract data from the file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload File to Extract Data</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Upload a PDF, DOCX, TXT file, or image containing invoice items. 
            We'll automatically extract item names, quantities, and prices.
          </div>

          {!file ? (
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <div className="space-y-2">
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <span className="text-primary hover:text-primary-hover">Choose a file</span>
                  <span className="text-muted-foreground"> or drag and drop</span>
                </Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept={Object.values(acceptedTypes).join(',')}
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="text-xs text-muted-foreground">
                  PDF, DOCX, TXT, JPG, PNG up to 10MB
                </div>
              </div>
            </div>
          ) : (
            <Card className="p-4">
              <div className="flex items-center gap-3">
                {getFileIcon(file)}
                <div className="flex-1">
                  <div className="font-medium">{file.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFile(null)}
                  disabled={isProcessing}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {isProcessing && (
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Processing file...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              )}
            </Card>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={isProcessing}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={!file || isProcessing}
            >
              {isProcessing ? "Processing..." : "Extract Data"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};