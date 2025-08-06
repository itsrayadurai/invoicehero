import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Upload, X, Palette, CreditCard, Settings } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { InvoiceData, LineItem } from "@/pages/CreateInvoice";

interface InvoiceEditorProps {
  invoiceData: InvoiceData;
  onUpdate: (data: Partial<InvoiceData>) => void;
}

export const InvoiceEditor = ({ invoiceData, onUpdate }: InvoiceEditorProps) => {
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const addLineItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      description: "",
      quantity: 1,
      price: 0,
      amount: 0
    };
    onUpdate({
      lineItems: [...invoiceData.lineItems, newItem]
    });
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    const updatedItems = invoiceData.lineItems.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'price') {
          updated.amount = updated.quantity * updated.price;
        }
        return updated;
      }
      return item;
    });
    
      const subtotal = updatedItems.reduce((sum, item) => sum + item.amount, 0);
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;
    
    onUpdate({
      lineItems: updatedItems,
      subtotal,
      salesTax: tax,
      total
    });
  };

  const removeLineItem = (id: string) => {
    const updatedItems = invoiceData.lineItems.filter(item => item.id !== id);
    const subtotal = updatedItems.reduce((sum, item) => sum + item.amount, 0);
    const tax = subtotal * 0.1;
    const total = subtotal + tax;
    
    onUpdate({
      lineItems: updatedItems,
      subtotal,
      salesTax: tax,
      total
    });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Create a unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `logo_${Date.now()}.${fileExt}`;
        
        // Upload to Supabase storage
        const { data, error } = await supabase.storage
          .from('invoice-logos')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          console.error('Upload error:', error);
          toast({
            title: "Upload failed",
            description: "Failed to upload logo. Please try again.",
            variant: "destructive",
          });
          return;
        }

        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('invoice-logos')
          .getPublicUrl(fileName);

        setLogoFile(file);
        onUpdate({ companyLogo: publicUrl });
        
        toast({
          title: "Logo uploaded!",
          description: "Your company logo has been uploaded successfully.",
        });
      } catch (error) {
        console.error('Logo upload error:', error);
        toast({
          title: "Upload failed",
          description: "Failed to upload logo. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Invoice Details</h2>
      
      {/* Company Information */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Company Information</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="company-logo">Company Logo</Label>
            <div className="flex items-center gap-4 mt-1">
              <input
                id="company-logo"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById('company-logo')?.click()}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                {invoiceData.companyLogo ? 'Change Logo' : 'Upload Logo'}
              </Button>
              {invoiceData.companyLogo && (
                <div className="flex items-center gap-2">
                  <img 
                    src={invoiceData.companyLogo} 
                    alt="Company Logo" 
                    className="h-12 w-12 object-contain border rounded-lg p-1" 
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onUpdate({ companyLogo: "" })}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
          <div>
            <Label htmlFor="company-name">Company Name</Label>
            <Input
              id="company-name"
              value={invoiceData.companyName}
              onChange={(e) => onUpdate({ companyName: e.target.value })}
              placeholder="Your Company Name"
            />
          </div>
          <div>
            <Label htmlFor="company-address">Company Address</Label>
            <Textarea
              id="company-address"
              value={invoiceData.companyAddress}
              onChange={(e) => onUpdate({ companyAddress: e.target.value })}
              placeholder="Your company address..."
              rows={3}
            />
          </div>
        </div>
      </Card>

      {/* Client Information */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Client Information</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="client-name">Client Name</Label>
            <Input
              id="client-name"
              value={invoiceData.clientName}
              onChange={(e) => onUpdate({ clientName: e.target.value })}
              placeholder="Client company name"
            />
          </div>
          <div>
            <Label htmlFor="client-email">Client Email</Label>
            <Input
              id="client-email"
              type="email"
              value={invoiceData.clientEmail || ""}
              onChange={(e) => onUpdate({ clientEmail: e.target.value })}
              placeholder="client@company.com"
            />
          </div>
          <div>
            <Label htmlFor="client-address">Client Address</Label>
            <Textarea
              id="client-address"
              value={invoiceData.clientAddress}
              onChange={(e) => onUpdate({ clientAddress: e.target.value })}
              placeholder="Client address..."
              rows={3}
            />
          </div>
        </div>
      </Card>

      {/* Invoice Details */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Invoice Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="invoice-number">Invoice Number</Label>
            <Input
              id="invoice-number"
              value={invoiceData.invoiceNumber}
              onChange={(e) => onUpdate({ invoiceNumber: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="po-number">PO Number</Label>
            <Input
              id="po-number"
              value={invoiceData.poNumber}
              onChange={(e) => onUpdate({ poNumber: e.target.value })}
              placeholder="Purchase Order Number"
            />
          </div>
          <div>
            <Label htmlFor="invoice-date">Invoice Date</Label>
            <Input
              id="invoice-date"
              type="date"
              value={invoiceData.invoiceDate}
              onChange={(e) => onUpdate({ invoiceDate: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="due-date">Due Date</Label>
            <Input
              id="due-date"
              type="date"
              value={invoiceData.dueDate}
              onChange={(e) => onUpdate({ dueDate: e.target.value })}
            />
          </div>
        </div>
      </Card>

      {/* Line Items */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Line Items</h3>
          <Button onClick={addLineItem} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
        <div className="space-y-3">
          {invoiceData.lineItems.map((item) => (
            <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-5">
                  <Input
                    placeholder="Item description"
                    value={item.description}
                    onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                  />
              </div>
              <div className="col-span-2">
                <Input
                  type="number"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) => updateLineItem(item.id, 'quantity', Number(e.target.value))}
                />
              </div>
              <div className="col-span-2">
                  <Input
                    type="number"
                    placeholder="Price"
                    value={item.price}
                    onChange={(e) => updateLineItem(item.id, 'price', Number(e.target.value))}
                  />
              </div>
              <div className="col-span-2">
                  <Input
                    placeholder="Amount"
                    value={item.amount.toFixed(2)}
                    readOnly
                    className="bg-muted"
                  />
              </div>
              <div className="col-span-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeLineItem(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Style & Customization */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Palette className="h-4 w-4" />
          <h3 className="font-semibold">Style & Customization</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="template">Template</Label>
            <Select value={invoiceData.template} onValueChange={(value) => onUpdate({ template: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="modern">Modern</SelectItem>
                <SelectItem value="classic">Classic</SelectItem>
                <SelectItem value="minimal">Minimal</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="font">Font</Label>
            <Select value={invoiceData.font} onValueChange={(value) => onUpdate({ font: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Inter">Inter</SelectItem>
                <SelectItem value="Roboto">Roboto</SelectItem>
                <SelectItem value="Open Sans">Open Sans</SelectItem>
                <SelectItem value="Lato">Lato</SelectItem>
                <SelectItem value="Merriweather">Merriweather</SelectItem>
                <SelectItem value="Playfair Display">Playfair Display</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="primary-color">Primary Color</Label>
            <Input
              id="primary-color"
              type="color"
              value={invoiceData.primaryColor}
              onChange={(e) => onUpdate({ primaryColor: e.target.value })}
              className="h-10"
            />
          </div>
          <div>
            <Label htmlFor="logo-position">Logo Position</Label>
            <Select value={invoiceData.logoPosition} onValueChange={(value) => onUpdate({ logoPosition: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Currency & Tax Settings */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <CreditCard className="h-4 w-4" />
          <h3 className="font-semibold">Currency & Tax Settings</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="currency">Currency</Label>
            <Select value={invoiceData.currency} onValueChange={(value) => onUpdate({ currency: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="GBP">GBP (£)</SelectItem>
                <SelectItem value="CAD">CAD (C$)</SelectItem>
                <SelectItem value="AUD">AUD (A$)</SelectItem>
                <SelectItem value="JPY">JPY (¥)</SelectItem>
                <SelectItem value="INR">INR (₹)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="tax-rate">Tax Rate (%)</Label>
            <Input
              id="tax-rate"
              type="number"
              value={invoiceData.taxRate}
              onChange={(e) => onUpdate({ taxRate: Number(e.target.value) })}
              placeholder="10"
            />
          </div>
          <div>
            <Label htmlFor="discount-type">Discount Type</Label>
            <Select value={invoiceData.discountType} onValueChange={(value) => onUpdate({ discountType: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">Percentage (%)</SelectItem>
                <SelectItem value="fixed">Fixed Amount</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="payment-terms">Payment Terms</Label>
            <Select value={invoiceData.paymentTerms} onValueChange={(value) => onUpdate({ paymentTerms: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Due on Receipt">Due on Receipt</SelectItem>
                <SelectItem value="Net 15">Net 15</SelectItem>
                <SelectItem value="Net 30">Net 30</SelectItem>
                <SelectItem value="Net 45">Net 45</SelectItem>
                <SelectItem value="Net 60">Net 60</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Bank Details */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <CreditCard className="h-4 w-4" />
          <h3 className="font-semibold">Bank Details</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="show-bank-details"
              checked={invoiceData.showBankDetails}
              onCheckedChange={(checked) => onUpdate({ showBankDetails: checked })}
            />
            <Label htmlFor="show-bank-details">Show bank details on invoice</Label>
          </div>
          {invoiceData.showBankDetails && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bank-name">Bank Name</Label>
                <Input
                  id="bank-name"
                  value={invoiceData.bankName}
                  onChange={(e) => onUpdate({ bankName: e.target.value })}
                  placeholder="Your Bank Name"
                />
              </div>
              <div>
                <Label htmlFor="account-number">Account Number</Label>
                <Input
                  id="account-number"
                  value={invoiceData.accountNumber}
                  onChange={(e) => onUpdate({ accountNumber: e.target.value })}
                  placeholder="Account Number"
                />
              </div>
              <div>
                <Label htmlFor="routing-number">Routing Number</Label>
                <Input
                  id="routing-number"
                  value={invoiceData.routingNumber}
                  onChange={(e) => onUpdate({ routingNumber: e.target.value })}
                  placeholder="Routing Number"
                />
              </div>
              <div>
                <Label htmlFor="swift-code">SWIFT Code</Label>
                <Input
                  id="swift-code"
                  value={invoiceData.swiftCode}
                  onChange={(e) => onUpdate({ swiftCode: e.target.value })}
                  placeholder="SWIFT Code"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="iban">IBAN</Label>
                <Input
                  id="iban"
                  value={invoiceData.iban}
                  onChange={(e) => onUpdate({ iban: e.target.value })}
                  placeholder="International Bank Account Number"
                />
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Display Options */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Settings className="h-4 w-4" />
          <h3 className="font-semibold">Display Options</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="show-subtotal"
              checked={invoiceData.showSubtotal}
              onCheckedChange={(checked) => onUpdate({ showSubtotal: checked })}
            />
            <Label htmlFor="show-subtotal">Show Subtotal</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="show-sales-tax"
              checked={invoiceData.showSalesTax}
              onCheckedChange={(checked) => onUpdate({ showSalesTax: checked })}
            />
            <Label htmlFor="show-sales-tax">Show Sales Tax</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="show-other-tax"
              checked={invoiceData.showOtherTax}
              onCheckedChange={(checked) => onUpdate({ showOtherTax: checked })}
            />
            <Label htmlFor="show-other-tax">Show Other Tax</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="show-shipping"
              checked={invoiceData.showShipping}
              onCheckedChange={(checked) => onUpdate({ showShipping: checked })}
            />
            <Label htmlFor="show-shipping">Show Shipping</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="show-discount"
              checked={invoiceData.showDiscount}
              onCheckedChange={(checked) => onUpdate({ showDiscount: checked })}
            />
            <Label htmlFor="show-discount">Show Discount</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="ship-to"
              checked={invoiceData.shipTo}
              onCheckedChange={(checked) => onUpdate({ shipTo: checked })}
            />
            <Label htmlFor="ship-to">Ship To Address</Label>
          </div>
        </div>
        {invoiceData.shipTo && (
          <div className="mt-4">
            <Label htmlFor="ship-to-address">Ship To Address</Label>
            <Textarea
              id="ship-to-address"
              value={invoiceData.shipToAddress}
              onChange={(e) => onUpdate({ shipToAddress: e.target.value })}
              placeholder="Shipping address..."
              rows={3}
            />
          </div>
        )}
      </Card>

      {/* Notes & Terms */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Notes & Terms</h3>
        <div>
          <Label htmlFor="notes">Additional Notes</Label>
          <Textarea
            id="notes"
            value={invoiceData.notes}
            onChange={(e) => onUpdate({ notes: e.target.value })}
            placeholder="Thank you for your business!"
            rows={4}
          />
        </div>
      </Card>
    </div>
  );
};