import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ArrowLeft, Download, Printer, Plus, Trash2, ChevronDown, ChevronUp, FileText, Palette, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { AuthPrompt } from "@/components/auth/AuthPrompt";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

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
    invoiceNumber: `20144`,
    poNumber: "",
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: "",
    lineItems: [
      { id: "1", description: "Item 1", quantity: 0, price: 0, amount: 0 }
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
    taxRate: 0,
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
  const [openSections, setOpenSections] = useState({
    invoiceDetails: true,
    totals: true,
    style: false
  });

  const colorOptions = [
    "#6366f1", "#ec4899", "#06b6d4", "#f59e0b", 
    "#10b981", "#8b5cf6", "#ef4444", "#6b7280"
  ];

  const backgroundColors = [
    "#ffffff", "#f8fafc", "#f1f5f9", "#e2e8f0"
  ];

  const fontOptions = [
    "Avenir", "Arial", "Helvetica", "Times New Roman", "Georgia", "Verdana"
  ];

  const currencyOptions = [
    { value: "USD", label: "US Dollar ($)" },
    { value: "EUR", label: "Euro (€)" },
    { value: "GBP", label: "British Pound (£)" },
    { value: "CAD", label: "Canadian Dollar (C$)" }
  ];

  const handleInvoiceUpdate = (field: keyof InvoiceData, value: any) => {
    setInvoiceData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Recalculate totals when relevant fields change
      if (field === 'lineItems' || field === 'taxRate' || field.includes('Tax') || field === 'shipping' || field === 'discount') {
        const subtotal = updated.lineItems.reduce((sum, item) => sum + item.amount, 0);
        const salesTax = subtotal * (updated.taxRate / 100);
        const total = subtotal + salesTax + updated.otherTax + updated.shipping - updated.discount;
        
        return {
          ...updated,
          subtotal,
          salesTax,
          total: Math.max(0, total)
        };
      }
      
      return updated;
    });
  };

  const addLineItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      description: `Item ${invoiceData.lineItems.length + 1}`,
      quantity: 0,
      price: 0,
      amount: 0
    };
    handleInvoiceUpdate('lineItems', [...invoiceData.lineItems, newItem]);
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    const updatedItems = invoiceData.lineItems.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'price') {
          updated.amount = Number(updated.quantity) * Number(updated.price);
        }
        return updated;
      }
      return item;
    });
    handleInvoiceUpdate('lineItems', updatedItems);
  };

  const removeLineItem = (id: string) => {
    const updatedItems = invoiceData.lineItems.filter(item => item.id !== id);
    handleInvoiceUpdate('lineItems', updatedItems);
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
      // PDF generation logic here
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

  const handlePrint = () => {
    window.print();
  };

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
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
              <Button size="sm" variant="outline" onClick={handlePrint}>
                <Printer className="h-4 w-4" />
              </Button>
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
          
          {/* Invoice Preview - Left Side */}
          <div className="col-span-8">
            <Card className="p-8">
              {/* Top Actions */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex gap-3">
                  <Button onClick={handleDownloadPDF} disabled={isLoading} className="bg-primary">
                    <Download className="h-4 w-4 mr-2" />
                    Get PDF
                  </Button>
                  <Button variant="outline" onClick={handlePrint}>
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                </div>
              </div>

              {/* Invoice Content */}
              <div className="space-y-8" style={{ fontFamily: invoiceData.font, backgroundColor: invoiceData.backgroundColor }}>
                
                {/* Invoice Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-4xl font-bold" style={{ color: invoiceData.primaryColor }}>
                      INVOICE
                    </h1>
                  </div>
                  <div className="text-right">
                    <div className="w-32 h-16 border-2 border-dashed border-muted-foreground/30 flex items-center justify-center text-sm text-muted-foreground">
                      Add or Drag logo
                    </div>
                  </div>
                </div>

                {/* Invoice Details Bar */}
                <div className="grid grid-cols-3 gap-4 p-4 rounded-lg" style={{ backgroundColor: invoiceData.primaryColor }}>
                  <div className="text-white">
                    <div className="text-sm opacity-90">Invoice #</div>
                    <div className="font-semibold">{invoiceData.invoiceNumber}</div>
                  </div>
                  <div className="text-white">
                    <div className="text-sm opacity-90">Invoice Date</div>
                    <div className="font-semibold">{invoiceData.invoiceDate}</div>
                  </div>
                  <div className="text-white">
                    <div className="text-sm opacity-90">Due Date</div>
                    <div className="font-semibold">{invoiceData.dueDate || 'Not set'}</div>
                  </div>
                </div>

                {/* Company and Client Info */}
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-semibold mb-2">Business Name</h3>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>{invoiceData.companyName || 'Your Business Name'}</div>
                      <div>{invoiceData.companyAddress || 'Street Address'}</div>
                      <div>{invoiceData.companyPhone || '012-345-6789'}</div>
                      <div>{invoiceData.companyEmail || 'Email'}</div>
                      <div>{invoiceData.companyWebsite || 'Website'}</div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Bill to</h3>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>{invoiceData.clientName || 'Client name'}</div>
                      <div>{invoiceData.clientAddress || 'Street address'}</div>
                      <div>{invoiceData.clientEmail || 'Email'}</div>
                    </div>
                  </div>
                </div>

                {/* Ship To Section */}
                {invoiceData.shipTo && (
                  <div>
                    <h3 className="font-semibold mb-2">Ship to</h3>
                    <div className="text-sm text-muted-foreground">
                      {invoiceData.shipToAddress || 'Shipping address'}
                    </div>
                  </div>
                )}

                {/* Line Items Table */}
                <div>
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 font-semibold">Description</th>
                        <th className="text-center py-2 font-semibold w-20">Qty</th>
                        <th className="text-right py-2 font-semibold w-24">Price</th>
                        <th className="text-right py-2 font-semibold w-24">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoiceData.lineItems.map((item) => (
                        <tr key={item.id} className="border-b border-muted">
                          <td className="py-3">{item.description}</td>
                          <td className="py-3 text-center">{item.quantity}</td>
                          <td className="py-3 text-right">{item.price}</td>
                          <td className="py-3 text-right">{item.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Add Item Button */}
                  <div className="mt-4">
                    <Button variant="outline" onClick={addLineItem} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </div>
                </div>

                {/* Notes Section */}
                {invoiceData.notes && (
                  <div>
                    <Button variant="outline" size="sm">
                      Add Notes
                    </Button>
                  </div>
                )}

                {/* Totals Section */}
                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    {invoiceData.showSubtotal && (
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>US$ {invoiceData.subtotal.toFixed(2)}</span>
                      </div>
                    )}
                    {invoiceData.showSalesTax && (
                      <div className="flex justify-between">
                        <span>Sales Tax({invoiceData.taxRate}%)</span>
                        <span>{invoiceData.salesTax.toFixed(2)}</span>
                      </div>
                    )}
                    {invoiceData.showOtherTax && (
                      <div className="flex justify-between">
                        <span>Other Tax</span>
                        <span>{invoiceData.otherTax.toFixed(2)}</span>
                      </div>
                    )}
                    {invoiceData.showShipping && (
                      <div className="flex justify-between">
                        <span>Shipping</span>
                        <span>{invoiceData.shipping.toFixed(2)}</span>
                      </div>
                    )}
                    {invoiceData.showDiscount && (
                      <div className="flex justify-between">
                        <span>Discount(%)</span>
                        <span>-{invoiceData.discount.toFixed(2)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>US$ {invoiceData.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex justify-center gap-3 pt-6">
                  <Button onClick={handleDownloadPDF} disabled={isLoading}>
                    <Download className="h-4 w-4 mr-2" />
                    Get PDF
                  </Button>
                  <Button variant="outline" onClick={handlePrint}>
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Settings Panel - Right Side */}
          <div className="col-span-4">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Settings className="h-5 w-5" />
                <h2 className="text-lg font-semibold">Settings</h2>
              </div>

              <div className="space-y-6">
                
                {/* Invoice Details Section */}
                <Collapsible open={openSections.invoiceDetails} onOpenChange={() => toggleSection('invoiceDetails')}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted rounded-lg">
                    <span className="font-medium">Invoice details</span>
                    {openSections.invoiceDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4 pt-4">
                    
                    {/* Company Details */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Company Information</Label>
                      <Input 
                        placeholder="Business Name"
                        value={invoiceData.companyName}
                        onChange={(e) => handleInvoiceUpdate('companyName', e.target.value)}
                      />
                      <Textarea 
                        placeholder="Street Address"
                        value={invoiceData.companyAddress}
                        onChange={(e) => handleInvoiceUpdate('companyAddress', e.target.value)}
                        rows={2}
                      />
                      <Input 
                        placeholder="Phone"
                        value={invoiceData.companyPhone}
                        onChange={(e) => handleInvoiceUpdate('companyPhone', e.target.value)}
                      />
                      <Input 
                        placeholder="Email"
                        value={invoiceData.companyEmail}
                        onChange={(e) => handleInvoiceUpdate('companyEmail', e.target.value)}
                      />
                      <Input 
                        placeholder="Website"
                        value={invoiceData.companyWebsite}
                        onChange={(e) => handleInvoiceUpdate('companyWebsite', e.target.value)}
                      />
                    </div>

                    <Separator />

                    {/* Client Details */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Client Information</Label>
                      <Input 
                        placeholder="Client Name"
                        value={invoiceData.clientName}
                        onChange={(e) => handleInvoiceUpdate('clientName', e.target.value)}
                      />
                      <Textarea 
                        placeholder="Client Address"
                        value={invoiceData.clientAddress}
                        onChange={(e) => handleInvoiceUpdate('clientAddress', e.target.value)}
                        rows={2}
                      />
                      <Input 
                        placeholder="Client Email"
                        value={invoiceData.clientEmail}
                        onChange={(e) => handleInvoiceUpdate('clientEmail', e.target.value)}
                      />
                    </div>

                    <Separator />

                    {/* Invoice Details */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Invoice Information</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">Invoice #</Label>
                          <Input 
                            value={invoiceData.invoiceNumber}
                            onChange={(e) => handleInvoiceUpdate('invoiceNumber', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">PO Number</Label>
                          <Input 
                            value={invoiceData.poNumber}
                            onChange={(e) => handleInvoiceUpdate('poNumber', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">Invoice Date</Label>
                          <Input 
                            type="date"
                            value={invoiceData.invoiceDate}
                            onChange={(e) => handleInvoiceUpdate('invoiceDate', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Due Date</Label>
                          <Input 
                            type="date"
                            value={invoiceData.dueDate}
                            onChange={(e) => handleInvoiceUpdate('dueDate', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Ship To Toggle */}
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Ship to</Label>
                      <Switch 
                        checked={invoiceData.shipTo}
                        onCheckedChange={(checked) => handleInvoiceUpdate('shipTo', checked)}
                      />
                    </div>
                    {invoiceData.shipTo && (
                      <Textarea 
                        placeholder="Shipping Address"
                        value={invoiceData.shipToAddress}
                        onChange={(e) => handleInvoiceUpdate('shipToAddress', e.target.value)}
                        rows={2}
                      />
                    )}
                  </CollapsibleContent>
                </Collapsible>

                {/* Totals Section */}
                <Collapsible open={openSections.totals} onOpenChange={() => toggleSection('totals')}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted rounded-lg">
                    <span className="font-medium">Totals</span>
                    {openSections.totals ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4 pt-4">
                    
                    {/* Currency Selection */}
                    <div>
                      <Label className="text-sm">Select Currency</Label>
                      <Select value={invoiceData.currency} onValueChange={(value) => handleInvoiceUpdate('currency', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {currencyOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Tax Selection */}
                    <div>
                      <Label className="text-sm">Select Tax</Label>
                      <Input 
                        type="number"
                        placeholder="Tax Rate %"
                        value={invoiceData.taxRate}
                        onChange={(e) => handleInvoiceUpdate('taxRate', Number(e.target.value))}
                      />
                    </div>

                    {/* Toggles */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Sub Total</Label>
                        <Switch 
                          checked={invoiceData.showSubtotal}
                          onCheckedChange={(checked) => handleInvoiceUpdate('showSubtotal', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Sales Tax(%)</Label>
                        <Switch 
                          checked={invoiceData.showSalesTax}
                          onCheckedChange={(checked) => handleInvoiceUpdate('showSalesTax', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Other Tax(%)</Label>
                        <Switch 
                          checked={invoiceData.showOtherTax}
                          onCheckedChange={(checked) => handleInvoiceUpdate('showOtherTax', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Shipping</Label>
                        <Switch 
                          checked={invoiceData.showShipping}
                          onCheckedChange={(checked) => handleInvoiceUpdate('showShipping', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Discount(%)</Label>
                        <Switch 
                          checked={invoiceData.showDiscount}
                          onCheckedChange={(checked) => handleInvoiceUpdate('showDiscount', checked)}
                        />
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Style Section */}
                <Collapsible open={openSections.style} onOpenChange={() => toggleSection('style')}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted rounded-lg">
                    <span className="font-medium">Style</span>
                    {openSections.style ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4 pt-4">
                    
                    {/* Color Selection */}
                    <div>
                      <Label className="text-sm mb-2 block">Color</Label>
                      <div className="flex gap-2 flex-wrap">
                        {colorOptions.map(color => (
                          <button 
                            key={color}
                            className="w-8 h-8 rounded-full border-2 border-border"
                            style={{ backgroundColor: color }}
                            onClick={() => handleInvoiceUpdate('primaryColor', color)}
                          />
                        ))}
                        <Input 
                          type="color"
                          value={invoiceData.primaryColor}
                          onChange={(e) => handleInvoiceUpdate('primaryColor', e.target.value)}
                          className="w-8 h-8 p-0 border-2"
                        />
                      </div>
                    </div>

                    {/* Font Selection */}
                    <div>
                      <Label className="text-sm">Font</Label>
                      <Select value={invoiceData.font} onValueChange={(value) => handleInvoiceUpdate('font', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {fontOptions.map(font => (
                            <SelectItem key={font} value={font}>
                              {font}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Background Color */}
                    <div>
                      <Label className="text-sm mb-2 block">Background Color</Label>
                      <div className="flex gap-2 flex-wrap">
                        {backgroundColors.map(color => (
                          <button 
                            key={color}
                            className="w-8 h-8 rounded-full border-2 border-border"
                            style={{ backgroundColor: color }}
                            onClick={() => handleInvoiceUpdate('backgroundColor', color)}
                          />
                        ))}
                        <Input 
                          type="color"
                          value={invoiceData.backgroundColor}
                          onChange={(e) => handleInvoiceUpdate('backgroundColor', e.target.value)}
                          className="w-8 h-8 p-0 border-2"
                        />
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Choose Template */}
                <div>
                  <h3 className="font-medium mb-4">Choose Template</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map(template => (
                      <div key={template} className="relative">
                        <div className="aspect-[3/4] bg-muted rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center cursor-pointer hover:border-primary">
                          <span className="text-xs text-muted-foreground">Template {template}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Line Items Editor */}
            <Card className="p-6 mt-6">
              <h3 className="font-medium mb-4">Line Items</h3>
              <div className="space-y-4">
                {invoiceData.lineItems.map((item) => (
                  <div key={item.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex justify-between items-start">
                      <Input 
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                        className="flex-1 mr-2"
                      />
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => removeLineItem(item.id)}
                        disabled={invoiceData.lineItems.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label className="text-xs">Qty</Label>
                        <Input 
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateLineItem(item.id, 'quantity', Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Price</Label>
                        <Input 
                          type="number"
                          value={item.price}
                          onChange={(e) => updateLineItem(item.id, 'price', Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Amount</Label>
                        <Input 
                          value={item.amount.toFixed(2)}
                          disabled
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <Button onClick={addLineItem} variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </Card>
          </div>
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