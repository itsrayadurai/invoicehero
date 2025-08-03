import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Upload, 
  FileText, 
  Image, 
  File,
  X,
  Sparkles,
  Loader2,
  CheckCircle,
  Camera,
  FileImage,
  Bot
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
  const [progress, setProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supportedTypes = [
    { 
      ext: "PDF", 
      icon: <FileText className="h-4 w-4" />, 
      types: ["application/pdf"],
      description: "Invoices, SOWs, Contracts"
    },
    { 
      ext: "DOC", 
      icon: <File className="h-4 w-4" />, 
      types: ["application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
      description: "Word documents"
    },
    { 
      ext: "IMG", 
      icon: <FileImage className="h-4 w-4" />, 
      types: ["image/jpeg", "image/png", "image/webp"],
      description: "Screenshots, Photos"
    }
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
      setProgress(20);
      
      // Convert file to base64
      const fileContent = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result as string;
          resolve(base64.split(',')[1]); // Remove data:type;base64, prefix
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      setProgress(40);

      // Get current user ID (or generate a temporary one for guests)
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || `guest_${Date.now()}`;

      setProgress(60);

      // Call the process-file edge function
      const response = await supabase.functions.invoke('process-file', {
        body: {
          fileName: file.name,
          fileType: file.type,
          fileContent: fileContent,
          userId: userId
        }
      });

      if (response.error) throw response.error;

      setUploading(false);
      setExtracting(true);
      setProgress(80);

      // Wait for the actual extraction to complete
      await new Promise(resolve => setTimeout(resolve, 3000));

      const { data: extractionData } = response;
      console.log('Extracted data:', extractionData);

      // Transform extracted data to match our InvoiceData structure
      const transformedData: Partial<InvoiceData> = {};

      if (extractionData?.extractedData) {
        const extracted = extractionData.extractedData;

        // Map client info
        if (extracted.clientInfo) {
          transformedData.clientName = extracted.clientInfo.name || "";
          transformedData.clientAddress = extracted.clientInfo.address || "";
        }

        // Map invoice info
        if (extracted.invoiceInfo) {
          transformedData.invoiceNumber = extracted.invoiceInfo.invoiceNumber || "";
          transformedData.poNumber = extracted.invoiceInfo.poNumber || "";
        }

        // Map line items
        if (extracted.lineItems && extracted.lineItems.length > 0) {
          transformedData.lineItems = extracted.lineItems.map((item: any, index: number) => ({
            id: (Date.now() + index).toString(),
            description: item.name || item.description || "",
            quantity: item.quantity || 1,
            price: item.rate || item.price || 0,
            amount: (item.quantity || 1) * (item.rate || item.price || 0)
          }));

          // Calculate totals
          const subtotal = transformedData.lineItems.reduce((sum, item) => sum + item.amount, 0);
          transformedData.subtotal = subtotal;
          transformedData.salesTax = subtotal * 0.1; // 10% default tax
          transformedData.total = subtotal + transformedData.salesTax;
        }
      }

      setProgress(100);
      setExtracting(false);
      onDataExtracted(transformedData);

      toast({
        title: "✨ Data extracted successfully!",
        description: "Invoice form has been auto-filled with extracted data",
      });

    } catch (error: any) {
      console.error('Error processing file:', error);
      setUploading(false);
      setExtracting(false);
      setProgress(0);
      toast({
        title: "Processing failed",
        description: error.message || "Failed to process file. Make sure OpenAI API key is configured.",
        variant: "destructive",
      });
    }
  };

  const getCurrentStatus = () => {
    if (extracting) return { 
      icon: <Bot className="h-6 w-6 animate-pulse text-blue-500" />, 
      text: "AI analyzing your file...", 
      color: "text-blue-600",
      subtext: "Extracting invoice data with AI"
    };
    if (uploading) return { 
      icon: <Upload className="h-6 w-6 animate-bounce text-green-500" />, 
      text: "Uploading file...", 
      color: "text-green-600",
      subtext: "Processing your document"
    };
    if (uploadedFile) return { 
      icon: <CheckCircle className="h-6 w-6 text-green-500" />, 
      text: "File ready for extraction", 
      color: "text-green-600",
      subtext: "Document uploaded successfully"
    };
    return { 
      icon: <Sparkles className="h-6 w-6 text-primary" />, 
      text: "Upload document for AI extraction", 
      color: "text-primary",
      subtext: "Drag & drop or click to browse files"
    };
  };

  const status = getCurrentStatus();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-background border-0 sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 p-6 sm:rounded-t-2xl rounded-t-2xl">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                <Bot className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">AI Document Extractor</h2>
                <p className="text-blue-100 text-sm">Upload any document to auto-fill your invoice</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Progress bar */}
          {(uploading || extracting) && (
            <div className="mt-4">
              <Progress value={progress} className="h-2 bg-white/20" />
              <p className="text-xs text-blue-100 mt-2">{progress}% complete</p>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Supported Formats */}
          <div className="grid grid-cols-3 gap-3">
            {supportedTypes.map((type, index) => (
              <div key={index} className="text-center p-3 bg-muted/50 rounded-lg border">
                <div className="flex justify-center mb-2 text-primary">
                  {type.icon}
                </div>
                <div className="text-sm font-medium">{type.ext}</div>
                <div className="text-xs text-muted-foreground mt-1">{type.description}</div>
              </div>
            ))}
          </div>

          {/* Upload Area */}
          <div
            className={`
              relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer
              ${isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' : 'border-border hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/10'}
              ${uploading || extracting ? 'opacity-50 pointer-events-none' : ''}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !uploading && !extracting && fileInputRef.current?.click()}
          >
            <div className={`${status.color} mb-4 flex justify-center`}>
              {status.icon}
            </div>
            
            <h3 className="text-xl font-semibold mb-2">{status.text}</h3>
            <p className="text-muted-foreground mb-4">{status.subtext}</p>
            
            {!uploadedFile && !uploading && !extracting && (
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
                <Upload className="h-5 w-5 mr-2" />
                Choose File
              </Button>
            )}

            {uploadedFile && (
              <div className="mt-4 p-4 bg-muted/30 rounded-lg border">
                <div className="flex items-center justify-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-sm">{uploadedFile.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {(uploadedFile.size / 1024 / 1024).toFixed(1)}MB
                    </div>
                  </div>
                </div>
              </div>
            )}

            {extracting && (
              <div className="mt-6 space-y-3">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg p-4 border">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <Bot className="h-5 w-5 text-blue-600 animate-pulse" />
                    <span className="text-sm font-medium text-blue-600">AI Processing</span>
                  </div>
                  <p className="text-xs text-blue-600/80 text-center">
                    Analyzing content • Extracting data • Structuring information
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span>Auto-extract line items</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span>Detect client details</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span>Smart data recognition</span>
            </div>
          </div>

          {/* File Info */}
          <div className="text-xs text-muted-foreground space-y-1 bg-muted/30 p-3 rounded-lg">
            <p>• Supported: PDF, DOC, DOCX, JPG, PNG, WebP</p>
            <p>• Maximum size: 10MB per file</p>
            <p>• Your files are processed securely and not permanently stored</p>
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
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
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