import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Upload, 
  FileText, 
  Sparkles, 
  Download, 
  Mail, 
  Save,
  Lock,
  Plus,
  Minus,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { InvoiceData } from "@/pages/CreateInvoice";
import { FileUpload } from "./FileUpload";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

interface MobileInvoiceCreatorProps {
  invoiceData: InvoiceData;
  onUpdate: (data: Partial<InvoiceData>) => void;
  onSave: () => Promise<string | null>;
  onDownload: () => void;
  onEmail: () => void;
  isLoading: boolean;
}

export const MobileInvoiceCreator = ({
  invoiceData,
  onUpdate,
  onSave,
  onDownload,
  onEmail,
  isLoading
}: MobileInvoiceCreatorProps) => {
  const { user } = useAuth();
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    company: true,
    client: false,
    details: false,
    items: false
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const addLineItem = () => {
    const newItem = {
      id: Date.now().toString(),
      name: "",
      quantity: 1,
      rate: 0,
      total: 0
    };
    onUpdate({
      lineItems: [...invoiceData.lineItems, newItem]
    });
  };

  const updateLineItem = (id: string, field: string, value: string | number) => {
    const updatedItems = invoiceData.lineItems.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'rate') {
          updated.total = updated.quantity * updated.rate;
        }
        return updated;
      }
      return item;
    });
    
    const subtotal = updatedItems.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.1;
    const total = subtotal + tax;
    
    onUpdate({
      lineItems: updatedItems,
      subtotal,
      tax,
      total
    });
  };

  const removeLineItem = (id: string) => {
    const updatedItems = invoiceData.lineItems.filter(item => item.id !== id);
    const subtotal = updatedItems.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.1;
    const total = subtotal + tax;
    
    onUpdate({
      lineItems: updatedItems,
      subtotal,
      tax,
      total
    });
  };

  const showAuthPrompt = (feature: string) => {
    toast({
      title: "Sign in required",
      description: `Sign in with Google to access ${feature} features`,
      variant: "default",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Creation Method Tabs */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b">
        <div className="px-4 py-3">
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-12">
              <TabsTrigger value="upload" className="text-sm gap-2">
                <Sparkles className="h-4 w-4" />
                AI Upload
              </TabsTrigger>
              <TabsTrigger value="manual" className="text-sm gap-2">
                <FileText className="h-4 w-4" />
                Manual Entry
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="mt-4">
              <Card className="p-4 bg-gradient-to-br from-accent/5 to-primary/5 border-accent/20">
                <div className="text-center">
                  <Sparkles className="h-8 w-8 text-accent mx-auto mb-3" />
                  <h3 className="font-semibold text-lg mb-2">AI-Powered Data Extraction</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Upload any file (PDF, image, document) and let AI automatically extract invoice data
                  </p>
                  <Button 
                    onClick={() => setShowFileUpload(true)}
                    className="w-full bg-gradient-to-r from-accent to-primary text-white"
                    size="lg"
                  >
                    <Upload className="h-5 w-5 mr-2" />
                    Upload File
                  </Button>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="manual" className="mt-4">
              <Card className="p-4">
                <div className="text-center">
                  <FileText className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold text-lg mb-2">Manual Invoice Creation</h3>
                  <p className="text-muted-foreground text-sm">
                    Fill out the form below to create your invoice manually
                  </p>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Main Form */}
      <div className="px-4 pb-24">
        {/* Company Information */}
        <Card className="mb-4">
          <div 
            className="flex items-center justify-between p-4 cursor-pointer"
            onClick={() => toggleSection('company')}
          >
            <h3 className="font-semibold text-lg">Company Information</h3>
            {expandedSections.company ? 
              <ChevronUp className="h-5 w-5" /> : 
              <ChevronDown className="h-5 w-5" />
            }
          </div>
          {expandedSections.company && (
            <div className="px-4 pb-4 space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Company Name</label>
                <input
                  type="text"
                  value={invoiceData.companyName}
                  onChange={(e) => onUpdate({ companyName: e.target.value })}
                  placeholder="Your Company Name"
                  className="w-full p-3 border rounded-lg text-base"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Company Address</label>
                <textarea
                  value={invoiceData.companyAddress}
                  onChange={(e) => onUpdate({ companyAddress: e.target.value })}
                  placeholder="Your company address..."
                  rows={3}
                  className="w-full p-3 border rounded-lg text-base resize-none"
                />
              </div>
            </div>
          )}
        </Card>

        {/* Client Information */}
        <Card className="mb-4">
          <div 
            className="flex items-center justify-between p-4 cursor-pointer"
            onClick={() => toggleSection('client')}
          >
            <h3 className="font-semibold text-lg">Client Information</h3>
            {expandedSections.client ? 
              <ChevronUp className="h-5 w-5" /> : 
              <ChevronDown className="h-5 w-5" />
            }
          </div>
          {expandedSections.client && (
            <div className="px-4 pb-4 space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Client Name</label>
                <input
                  type="text"
                  value={invoiceData.clientName}
                  onChange={(e) => onUpdate({ clientName: e.target.value })}
                  placeholder="Client company name"
                  className="w-full p-3 border rounded-lg text-base"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Client Email
                  {!user && <Badge className="ml-2 text-xs bg-primary/10 text-primary">Premium</Badge>}
                </label>
                <input
                  type="email"
                  value={invoiceData.clientEmail || ""}
                  onChange={(e) => onUpdate({ clientEmail: e.target.value })}
                  placeholder="client@company.com"
                  className="w-full p-3 border rounded-lg text-base"
                  disabled={!user}
                  onClick={() => !user && showAuthPrompt("email")}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Client Address</label>
                <textarea
                  value={invoiceData.clientAddress}
                  onChange={(e) => onUpdate({ clientAddress: e.target.value })}
                  placeholder="Client address..."
                  rows={3}
                  className="w-full p-3 border rounded-lg text-base resize-none"
                />
              </div>
            </div>
          )}
        </Card>

        {/* Invoice Details */}
        <Card className="mb-4">
          <div 
            className="flex items-center justify-between p-4 cursor-pointer"
            onClick={() => toggleSection('details')}
          >
            <h3 className="font-semibold text-lg">Invoice Details</h3>
            {expandedSections.details ? 
              <ChevronUp className="h-5 w-5" /> : 
              <ChevronDown className="h-5 w-5" />
            }
          </div>
          {expandedSections.details && (
            <div className="px-4 pb-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Invoice #</label>
                  <input
                    type="text"
                    value={invoiceData.invoiceNumber}
                    onChange={(e) => onUpdate({ invoiceNumber: e.target.value })}
                    className="w-full p-3 border rounded-lg text-base"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">PO Number</label>
                  <input
                    type="text"
                    value={invoiceData.poNumber}
                    onChange={(e) => onUpdate({ poNumber: e.target.value })}
                    placeholder="Optional"
                    className="w-full p-3 border rounded-lg text-base"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Invoice Date</label>
                  <input
                    type="date"
                    value={invoiceData.invoiceDate}
                    onChange={(e) => onUpdate({ invoiceDate: e.target.value })}
                    className="w-full p-3 border rounded-lg text-base"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Due Date</label>
                  <input
                    type="date"
                    value={invoiceData.dueDate}
                    onChange={(e) => onUpdate({ dueDate: e.target.value })}
                    className="w-full p-3 border rounded-lg text-base"
                  />
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Line Items */}
        <Card className="mb-4">
          <div 
            className="flex items-center justify-between p-4 cursor-pointer"
            onClick={() => toggleSection('items')}
          >
            <h3 className="font-semibold text-lg">
              Line Items ({invoiceData.lineItems.length})
            </h3>
            {expandedSections.items ? 
              <ChevronUp className="h-5 w-5" /> : 
              <ChevronDown className="h-5 w-5" />
            }
          </div>
          {expandedSections.items && (
            <div className="px-4 pb-4">
              <Button 
                onClick={addLineItem} 
                variant="outline" 
                className="w-full mb-4"
                size="lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Line Item
              </Button>

              <div className="space-y-4">
                {invoiceData.lineItems.map((item, index) => (
                  <div key={item.id} className="border rounded-lg p-4 bg-muted/30">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-medium">Item {index + 1}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLineItem(item.id)}
                        className="text-destructive"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Item description"
                        value={item.name}
                        onChange={(e) => updateLineItem(item.id, 'name', e.target.value)}
                        className="w-full p-3 border rounded-lg text-base"
                      />
                      
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="text-xs text-muted-foreground">Qty</label>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateLineItem(item.id, 'quantity', Number(e.target.value))}
                            className="w-full p-2 border rounded text-base"
                            min="1"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Rate</label>
                          <input
                            type="number"
                            value={item.rate}
                            onChange={(e) => updateLineItem(item.id, 'rate', Number(e.target.value))}
                            className="w-full p-2 border rounded text-base"
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Total</label>
                          <div className="p-2 bg-muted rounded text-base font-medium">
                            ${item.total.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="mt-6 space-y-2 bg-muted/30 p-4 rounded-lg">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${invoiceData.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (10%):</span>
                  <span>${invoiceData.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>${invoiceData.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Mobile Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t p-4 z-50">
        <div className="flex gap-3">
          {/* Save - Premium Feature */}
          <Button 
            variant="outline" 
            size="lg" 
            className="flex-1"
            disabled={!user}
            onClick={() => !user ? showAuthPrompt("save") : onSave()}
          >
            {!user && <Lock className="h-4 w-4 mr-2" />}
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>

          {/* Download PDF - Free */}
          <Button 
            size="lg" 
            className="flex-1 bg-accent hover:bg-accent/90"
            onClick={onDownload}
            disabled={isLoading}
          >
            <Download className="h-4 w-4 mr-2" />
            {isLoading ? "Generating..." : "PDF"}
          </Button>

          {/* Email - Premium Feature */}
          <Button 
            variant="outline" 
            size="lg" 
            className="flex-1"
            disabled={!user || isLoading}
            onClick={() => !user ? showAuthPrompt("email") : onEmail()}
          >
            {!user && <Lock className="h-4 w-4 mr-2" />}
            <Mail className="h-4 w-4 mr-2" />
            Email
          </Button>
        </div>

        {!user && (
          <p className="text-xs text-muted-foreground text-center mt-2">
            Sign in to unlock Save & Email features
          </p>
        )}
      </div>

      {/* File Upload Modal */}
      {showFileUpload && (
        <FileUpload
          onClose={() => setShowFileUpload(false)}
          onDataExtracted={(data) => {
            onUpdate(data);
            setShowFileUpload(false);
            // Expand relevant sections after auto-fill
            setExpandedSections({
              company: true,
              client: true,
              details: true,
              items: true
            });
          }}
        />
      )}
    </div>
  );
};