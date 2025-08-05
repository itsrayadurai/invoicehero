import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Download, Mail, Sparkles, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { AuthPrompt } from "@/components/auth/AuthPrompt";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { FileUpload } from "@/components/invoice/FileUpload";
import { InvoiceEditor } from "@/components/invoice/InvoiceEditor";
import { InvoicePreview } from "@/components/invoice/InvoicePreview";

export interface InvoiceData {
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  companyWebsite: string;
  companyLogo?: string;
  clientName: string;
  clientAddress: string;
  clientEmail?: string;
  invoiceNumber: string;
  poNumber: string;
  invoiceDate: string;
  dueDate: string;
  lineItems: LineItem[];
  subtotal: number;
  salesTax: number;
  otherTax: number;
  shipping: number;
  discount: number;
  total: number;
  notes: string;
  // Styling options
  primaryColor: string;
  backgroundColor: string;
  font: string;
  currency: string;
  taxRate: number;
  showSubtotal: boolean;
  showSalesTax: boolean;
  showOtherTax: boolean;
  showShipping: boolean;
  showDiscount: boolean;
  shipTo: boolean;
  shipToAddress: string;
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
  amount: number;
}

const CreateInvoice = () => {
  const { user, session } = useAuth();
  const isMobile = useIsMobile();
  
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    companyName: "",
    companyAddress: "",
    companyPhone: "",
    companyEmail: "",
    companyWebsite: "",
    clientName: "",
    clientAddress: "",
    clientEmail: "",
    invoiceNumber: `INV-${Math.floor(Math.random() * 1000000)}`,
    poNumber: "",
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: "",
    lineItems: [
      { id: "1", description: "", quantity: 1, price: 0, amount: 0 }
    ],
    subtotal: 0,
    salesTax: 0,
    otherTax: 0,
    shipping: 0,
    discount: 0,
    total: 0,
    notes: "",
    primaryColor: "#6366f1",
    backgroundColor: "#ffffff",
    font: "Avenir",
    currency: "USD",
    taxRate: 10,
    showSubtotal: true,
    showSalesTax: true,
    showOtherTax: false,
    showShipping: false,
    showDiscount: false,
    shipTo: false,
    shipToAddress: ""
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [authPromptFeature, setAuthPromptFeature] = useState("");
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [activeTab, setActiveTab] = useState<"ai-upload" | "manual">("manual");

  const handleInvoiceUpdate = (data: Partial<InvoiceData>) => {
    setInvoiceData(prev => ({ ...prev, ...data }));
  };

  const handleDataExtracted = (extractedData: Partial<InvoiceData>) => {
    setInvoiceData(prev => ({ ...prev, ...extractedData }));
    setShowFileUpload(false);
    setActiveTab("manual");
    toast({
      title: "Data Extracted Successfully",
      description: "Invoice data has been extracted and populated.",
    });
  };

  const handleDownloadPDF = async () => {
    if (!invoiceData.clientName || !invoiceData.companyName) {
      toast({
        title: "Missing information",
        description: "Please fill in company and client information",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('generate-pdf', {
        body: { invoiceData }
      });

      if (error) throw error;

      toast({
        title: "PDF Generated",
        description: "Invoice PDF has been generated",
      });
    } catch (error: any) {
      toast({
        title: "PDF generation failed",
        description: error.message || "Failed to generate PDF",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!user) {
      setAuthPromptFeature("Send Email");
      setShowAuthPrompt(true);
      return;
    }

    if (!invoiceData.clientEmail) {
      toast({
        title: "Missing client email",
        description: "Please add client email address",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: { 
          invoiceData,
          clientEmail: invoiceData.clientEmail,
          type: 'invoice'
        }
      });

      if (error) throw error;

      toast({
        title: "Email sent",
        description: "Invoice has been sent to client",
      });
    } catch (error: any) {
      toast({
        title: "Email failed",
        description: error.message || "Failed to send email",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Mobile view
  if (isMobile) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur-sm">
          <div className="flex items-center justify-between px-4 py-3">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-lg font-semibold">Create Invoice</h1>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleDownloadPDF} disabled={isLoading}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <Card className="p-4">
            <div className="text-center text-muted-foreground">
              Mobile version - Use desktop for full invoice builder experience
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Desktop view
  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-primary to-accent p-2 rounded-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold">EaseInvoice</h1>
                  <p className="text-sm text-muted-foreground">Professional invoice builder</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-6">
          
          {/* Left Panel - Input/Editor */}
          <div className="col-span-5">
            <Card className="p-6">
              {/* Tabs for AI Upload and Manual Entry */}
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "ai-upload" | "manual")}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="ai-upload" className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    AI Upload
                  </TabsTrigger>
                  <TabsTrigger value="manual" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Manual Entry
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="ai-upload" className="space-y-6">
                  <div className="text-center space-y-4">
                    <div className="flex justify-center">
                      <div className="bg-gradient-to-br from-green-400 to-blue-500 p-3 rounded-xl">
                        <Sparkles className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold mb-2">AI-Powered Data Extraction</h2>
                      <p className="text-sm text-muted-foreground">
                        Upload any file (PDF, image, document) and let AI automatically extract invoice data
                      </p>
                    </div>
                    <Button 
                      onClick={() => setShowFileUpload(true)}
                      className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white"
                      size="lg"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Upload File
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="manual" className="space-y-6">
                  <InvoiceEditor 
                    invoiceData={invoiceData} 
                    onUpdate={handleInvoiceUpdate}
                  />
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          {/* Right Panel - Preview */}
          <div className="col-span-7">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Preview</h2>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={handleSendEmail} 
                    disabled={isLoading}
                    className="flex items-center gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    Email
                  </Button>
                  <Button onClick={handleDownloadPDF} disabled={isLoading}>
                    <Download className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                </div>
              </div>
              
              <Card className="p-6">
                <InvoicePreview invoiceData={invoiceData} />
                
                {/* Bottom Actions */}
                <div className="flex justify-center gap-3 pt-6 border-t">
                  <Button 
                    variant="outline" 
                    disabled={!user}
                    className="flex items-center gap-2"
                  >
                    📁 Save
                  </Button>
                  <Button 
                    onClick={handleDownloadPDF} 
                    disabled={isLoading}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleSendEmail} 
                    disabled={isLoading || !user}
                    className="flex items-center gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    Email
                  </Button>
                </div>
                
                {!user && (
                  <p className="text-center text-sm text-muted-foreground mt-4">
                    Sign in to unlock Save & Email features
                  </p>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* File Upload Modal */}
      {showFileUpload && (
        <FileUpload
          onClose={() => setShowFileUpload(false)}
          onDataExtracted={handleDataExtracted}
        />
      )}

      {/* Auth Prompt */}
      <AuthPrompt
        isOpen={showAuthPrompt}
        onClose={() => setShowAuthPrompt(false)}
        feature={authPromptFeature}
      />
    </div>
  );
};

export default CreateInvoice;