import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Eye, EyeOff, Mail, Download, FileText, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { MobileInvoiceCreator } from "@/components/invoice/MobileInvoiceCreator";
import { InvoicePreview } from "@/components/invoice/InvoicePreview";
import { AuthPrompt } from "@/components/auth/AuthPrompt";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface InvoiceData {
  companyName: string;
  companyAddress: string;
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
  const { user, session } = useAuth();
  const isMobile = useIsMobile();
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    companyName: "",
    companyAddress: "",
    clientName: "",
    clientAddress: "",
    clientEmail: "",
    invoiceNumber: `INV-${Date.now()}`,
    poNumber: "",
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: "",
    lineItems: [],
    subtotal: 0,
    tax: 0,
    total: 0
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [authPromptFeature, setAuthPromptFeature] = useState("");

  const handleInvoiceUpdate = (data: Partial<InvoiceData>) => {
    setInvoiceData(prev => ({ ...prev, ...data }));
  };

  const handleSaveInvoice = async () => {
    if (!user || !session) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save invoices",
        variant: "destructive",
      });
      return null;
    }

    try {
      setIsLoading(true);

      // Save invoice to database
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          user_id: user.id,
          invoice_number: invoiceData.invoiceNumber,
          client_name: invoiceData.clientName,
          client_email: invoiceData.clientEmail,
          client_address: invoiceData.clientAddress,
          company_name: invoiceData.companyName,
          company_address: invoiceData.companyAddress,
          issue_date: invoiceData.invoiceDate,
          due_date: invoiceData.dueDate,
          subtotal: invoiceData.subtotal,
          tax_rate: 10, // 10% tax rate
          tax_amount: invoiceData.tax,
          total: invoiceData.total,
          status: 'draft'
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Save line items
      if (invoiceData.lineItems.length > 0) {
        const { error: lineItemsError } = await supabase
          .from('line_items')
          .insert(
            invoiceData.lineItems.map(item => ({
              invoice_id: invoice.id,
              description: item.name,
              quantity: item.quantity,
              rate: item.rate,
              amount: item.total
            }))
          );

        if (lineItemsError) throw lineItemsError;
      }

      toast({
        title: "Invoice saved",
        description: "Your invoice has been saved successfully",
      });

      return invoice.id;
    } catch (error: any) {
      console.error('Error saving invoice:', error);
      toast({
        title: "Save failed",
        description: error.message || "Failed to save invoice",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
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

      const response = await supabase.functions.invoke('generate-pdf', {
        body: {
          invoiceData: {
            company: {
              name: invoiceData.companyName,
              address: invoiceData.companyAddress,
              logo: invoiceData.companyLogo
            },
            client: {
              name: invoiceData.clientName,
              address: invoiceData.clientAddress,
              email: invoiceData.clientEmail
            },
            invoice: {
              number: invoiceData.invoiceNumber,
              date: invoiceData.invoiceDate,
              dueDate: invoiceData.dueDate,
              poNumber: invoiceData.poNumber
            },
            lineItems: invoiceData.lineItems.map(item => ({
              description: item.name,
              quantity: item.quantity,
              rate: item.rate,
              amount: item.total
            })),
            totals: {
              subtotal: invoiceData.subtotal,
              tax: invoiceData.tax,
              total: invoiceData.total
            }
          },
          saveToDatabase: false
        }
      });

      if (response.error) throw response.error;

      // Create and download the PDF
      const { htmlContent } = response.data;
      
      // Open in new window for now (you can implement proper PDF generation later)
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(htmlContent);
        newWindow.document.close();
      }

      toast({
        title: "PDF Generated",
        description: "Invoice PDF has been generated",
      });

    } catch (error: any) {
      console.error('Error generating PDF:', error);
      toast({
        title: "PDF generation failed",
        description: error.message || "Failed to generate PDF",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailInvoice = async () => {
    if (!user || !session) {
      setAuthPromptFeature("email");
      setShowAuthPrompt(true);
      return;
    }

    if (!invoiceData.clientEmail) {
      toast({
        title: "Missing email",
        description: "Please enter the client's email address",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      // First save the invoice
      const invoiceId = await handleSaveInvoice();
      if (!invoiceId) return;

      // Send email
      const response = await supabase.functions.invoke('send-email', {
        body: {
          invoiceId,
          clientEmail: invoiceData.clientEmail,
          clientName: invoiceData.clientName,
          invoiceNumber: invoiceData.invoiceNumber,
          customMessage: `Please find attached invoice ${invoiceData.invoiceNumber} for your review.`
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        }
      });

      if (response.error) throw response.error;

      // Sync with HubSpot
      try {
        await supabase.functions.invoke('hubspot-sync', {
          body: {
            invoiceId,
            action: 'sync_all'
          },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          }
        });
        
        toast({
          title: "Invoice sent and synced",
          description: "Invoice has been emailed and synced to HubSpot",
        });
      } catch (hubspotError) {
        console.error('HubSpot sync failed:', hubspotError);
        toast({
          title: "Invoice sent",
          description: "Invoice emailed successfully (HubSpot sync failed)",
        });
      }

    } catch (error: any) {
      console.error('Error sending email:', error);
      toast({
        title: "Email failed",
        description: error.message || "Failed to send email",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Mobile-first responsive design
  if (isMobile) {
    return (
      <>
        <div className="min-h-screen bg-background">
          {/* Mobile Header */}
          <div className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur-sm">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <Link to="/">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
                <div className="flex items-center gap-2">
                  <div className="bg-gradient-to-br from-primary to-accent p-1.5 rounded-lg">
                    <FileText className="h-4 w-4 text-white" />
                  </div>
                  <h1 className="text-lg font-semibold">EaseInvoice</h1>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Mobile Content */}
          {showPreview ? (
            <div className="p-4 pb-24">
              <Card className="p-4">
                <InvoicePreview invoiceData={invoiceData} />
              </Card>
            </div>
          ) : (
            <MobileInvoiceCreator
              invoiceData={invoiceData}
              onUpdate={handleInvoiceUpdate}
              onSave={handleSaveInvoice}
              onDownload={handleDownloadPDF}
              onEmail={handleEmailInvoice}
              isLoading={isLoading}
            />
          )}
        </div>

        {/* Auth Prompt */}
        <AuthPrompt
          isOpen={showAuthPrompt}
          onClose={() => setShowAuthPrompt(false)}
          feature={authPromptFeature}
        />
      </>
    );
  }

  // Desktop layout
  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Header */}
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
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-primary to-accent p-2 rounded-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold">EaseInvoice</h1>
                  <p className="text-sm text-muted-foreground">Create professional invoices in seconds</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={handleEmailInvoice}
                disabled={isLoading || !user}
              >
                <Mail className="h-4 w-4 mr-2" />
                {isLoading ? "Sending..." : "Email"}
              </Button>
              <Button 
                onClick={handleDownloadPDF}
                disabled={isLoading}
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
              >
                <Download className="h-4 w-4 mr-2" />
                {isLoading ? "Generating..." : "Download PDF"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Desktop Editor */}
          <Card className="p-6">
            <MobileInvoiceCreator
              invoiceData={invoiceData}
              onUpdate={handleInvoiceUpdate}
              onSave={handleSaveInvoice}
              onDownload={handleDownloadPDF}
              onEmail={handleEmailInvoice}
              isLoading={isLoading}
            />
          </Card>

          {/* Desktop Preview */}
          <Card className="p-6">
            <InvoicePreview invoiceData={invoiceData} />
          </Card>
        </div>
      </div>

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