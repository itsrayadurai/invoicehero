import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, Upload } from "lucide-react";
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

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const url = URL.createObjectURL(file);
      onUpdate({ companyLogo: url });
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
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Logo
              </Button>
              {invoiceData.companyLogo && (
                <img src={invoiceData.companyLogo} alt="Logo" className="h-8 w-8 object-contain" />
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
    </div>
  );
};