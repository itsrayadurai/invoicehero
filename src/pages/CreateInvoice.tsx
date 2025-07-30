import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Upload, Download, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { InvoiceEditor } from "@/components/invoice/InvoiceEditor";
import { InvoicePreview } from "@/components/invoice/InvoicePreview";
import { FileUpload } from "@/components/invoice/FileUpload";

export interface InvoiceData {
  companyName: string;
  companyAddress: string;
  companyLogo?: string;
  clientName: string;
  clientAddress: string;
  invoiceNumber: string;
  poNumber: string;
  invoiceDate: string;
  dueDate: string;
  lineItems: LineItem[];
  subtotal: number;
  tax: number;
  total: number;
}

export interface LineItem {
  id: string;
  name: string;
  quantity: number;
  rate: number;
  total: number;
}

const CreateInvoice = () => {
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    companyName: "",
    companyAddress: "",
    clientName: "",
    clientAddress: "",
    invoiceNumber: `INV-${Date.now()}`,
    poNumber: "",
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: "",
    lineItems: [],
    subtotal: 0,
    tax: 0,
    total: 0
  });

  const [showFileUpload, setShowFileUpload] = useState(false);

  const handleInvoiceUpdate = (data: Partial<InvoiceData>) => {
    setInvoiceData(prev => ({ ...prev, ...data }));
  };

  const handleDownloadPDF = () => {
    // TODO: Implement PDF download
    console.log("Download PDF", invoiceData);
  };

  const handleEmailInvoice = () => {
    // TODO: Implement email sending
    console.log("Email invoice", invoiceData);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <h1 className="text-2xl font-semibold">Create Invoice</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFileUpload(true)}
                className="hidden sm:flex"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload File
              </Button>
              <Button variant="outline" onClick={handleEmailInvoice}>
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
              <Button onClick={handleDownloadPDF}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor Panel */}
          <Card className="p-6">
            <InvoiceEditor 
              invoiceData={invoiceData} 
              onUpdate={handleInvoiceUpdate} 
            />
          </Card>

          {/* Preview Panel */}
          <Card className="p-6">
            <InvoicePreview invoiceData={invoiceData} />
          </Card>
        </div>
      </div>

      {/* File Upload Modal */}
      {showFileUpload && (
        <FileUpload
          onClose={() => setShowFileUpload(false)}
          onDataExtracted={(data) => {
            handleInvoiceUpdate(data);
            setShowFileUpload(false);
          }}
        />
      )}
    </div>
  );
};

export default CreateInvoice;