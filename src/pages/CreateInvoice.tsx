import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Upload, Download, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { InvoiceEditor } from "@/components/invoice/InvoiceEditor";
import { InvoicePreview } from "@/components/invoice/InvoicePreview";
import { FileUpload } from "@/components/invoice/FileUpload";
import { useAuth } from "@/hooks/useAuth";
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

  const [showFileUpload, setShowFileUpload] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
    if (!invoiceData.clientEmail) {
      toast({
        title: "Missing email",
        description: "Please enter the client's email address",
        variant: "destructive",
      });
      return;
    }

    if (!user || !session) {
      toast({
        title: "Authentication required",
        description: "Please sign in to send emails",
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
              <Button 
                variant="outline" 
                onClick={handleEmailInvoice}
                disabled={isLoading}
              >
                <Mail className="h-4 w-4 mr-2" />
                {isLoading ? "Sending..." : "Email"}
              </Button>
              <Button 
                onClick={handleDownloadPDF}
                disabled={isLoading}
              >
                <Download className="h-4 w-4 mr-2" />
                {isLoading ? "Generating..." : "Download PDF"}
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