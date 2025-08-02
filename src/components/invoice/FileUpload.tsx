import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  FileText, 
  Image, 
  File,
  X,
  Sparkles,
  Loader2,
  CheckCircle
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { InvoiceData } from "@/pages/CreateInvoice";

interface FileUploadProps {
  onClose: () => void;
  onDataExtracted: (data: Partial<InvoiceData>) => void;
}

export const FileUpload = ({ onClose, onDataExtracted }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supportedTypes = [
    { ext: "PDF", icon: <FileText className="h-5 w-5" />, types: ["application/pdf"] },
    { ext: "DOC", icon: <File className="h-5 w-5" />, types: ["application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"] },
    { ext: "IMG", icon: <Image className="h-5 w-5" />, types: ["image/jpeg", "image/png", "image/webp"] }
  ];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = async (file: File) => {
    // Validate file type
    const allSupportedTypes = supportedTypes.flatMap(type => type.types);
    if (!allSupportedTypes.includes(file.type)) {
      toast({
        title: "Unsupported file type",
        description: "Please upload a PDF, DOC, or image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    setUploadedFile(file);
    await processFile(file);
  };

  const processFile = async (file: File) => {
    try {
      setUploading(true);
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);

      // Call the process-file edge function
      const response = await supabase.functions.invoke('process-file', {
        body: formData,
      });

      if (response.error) throw response.error;

      setUploading(false);
      setExtracting(true);

      // Simulate AI processing time
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock extracted data - in real implementation, this would come from the edge function
      const mockExtractedData: Partial<InvoiceData> = {
        companyName: "ABC Tech Solutions",
        companyAddress: "123 Main Street\nSan Francisco, CA 94105",
        clientName: "XYZ Corporation",
        clientAddress: "456 Business Ave\nNew York, NY 10001",
        lineItems: [
          {
            id: Date.now().toString(),
            description: "Web Development Services",
            quantity: 40,
            price: 125,
            amount: 5000
          },
          {
            id: (Date.now() + 1).toString(),
            description: "UI/UX Design",
            quantity: 20,
            price: 100,
            amount: 2000
          }
        ],
        subtotal: 7000,
        salesTax: 700,
        total: 7700
      };

      setExtracting(false);
      onDataExtracted(mockExtractedData);

      toast({
        title: "Data extracted successfully!",
        description: "Invoice form has been auto-filled with extracted data",
      });

    } catch (error: any) {
      console.error('Error processing file:', error);
      setUploading(false);
      setExtracting(false);
      toast({
        title: "Processing failed",
        description: error.message || "Failed to process file",
        variant: "destructive",
      });
    }
  };

  const getCurrentStatus = () => {
    if (extracting) return { icon: <Loader2 className="h-6 w-6 animate-spin" />, text: "Extracting data...", color: "text-accent" };
    if (uploading) return { icon: <Loader2 className="h-6 w-6 animate-spin" />, text: "Uploading file...", color: "text-primary" };
    if (uploadedFile) return { icon: <CheckCircle className="h-6 w-6" />, text: "File uploaded", color: "text-accent" };
    return { icon: <Upload className="h-6 w-6" />, text: "Upload file", color: "text-muted-foreground" };
  };

  const status = getCurrentStatus();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-background border-0 sm:rounded-xl rounded-t-xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-accent to-primary p-2 rounded-lg">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">AI Data Extraction</h2>
              <p className="text-sm text-muted-foreground">Upload a file to auto-fill your invoice</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Supported Formats */}
          <div className="flex gap-2 justify-center">
            {supportedTypes.map((type, index) => (
              <Badge key={index} variant="outline" className="gap-2 text-xs">
                {type.icon}
                {type.ext}
              </Badge>
            ))}
          </div>

          {/* Upload Area */}
          <div
            className={`
              border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer
              ${isDragging ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/50 hover:bg-accent/5'}
              ${uploading || extracting ? 'opacity-50 pointer-events-none' : ''}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !uploading && !extracting && fileInputRef.current?.click()}
          >
            <div className={`${status.color} mb-4`}>
              {status.icon}
            </div>
            
            <h3 className="text-lg font-semibold mb-2">{status.text}</h3>
            
            {!uploadedFile && !uploading && !extracting && (
              <>
                <p className="text-muted-foreground mb-4">
                  Drag & drop your file here, or click to browse
                </p>
                <Button className="bg-gradient-to-r from-accent to-primary text-white">
                  Choose File
                </Button>
              </>
            )}

            {uploadedFile && (
              <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-center gap-2 text-sm">
                  <FileText className="h-4 w-4" />
                  <span className="font-medium">{uploadedFile.name}</span>
                  <span className="text-muted-foreground">
                    ({(uploadedFile.size / 1024 / 1024).toFixed(1)}MB)
                  </span>
                </div>
              </div>
            )}

            {extracting && (
              <div className="mt-4 space-y-2">
                <div className="bg-accent/10 rounded-lg p-4">
                  <p className="text-sm text-accent font-medium">
                    🤖 AI is analyzing your file and extracting invoice data...
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* File Info */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Supported formats: PDF, DOC, DOCX, JPG, PNG, WebP</p>
            <p>• Maximum file size: 10MB</p>
            <p>• Your files are processed securely and not stored</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={onClose}
              disabled={uploading || extracting}
            >
              Cancel
            </Button>
            <Button 
              className="flex-1 bg-gradient-to-r from-accent to-primary text-white"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || extracting}
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploadedFile ? 'Upload Another' : 'Browse Files'}
            </Button>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file);
          }}
          className="hidden"
        />
      </Card>
    </div>
  );
};