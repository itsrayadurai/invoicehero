import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Mail, Eye, EyeOff } from "lucide-react";
import { InvoiceData } from "@/pages/CreateInvoice";
import { useState } from "react";

interface InvoicePreviewProps {
  invoiceData: InvoiceData;
  onDownload?: () => void;
  onSendEmail?: () => void;
}

export const InvoicePreview = ({ invoiceData, onDownload, onSendEmail }: InvoicePreviewProps) => {
  const [showPreview, setShowPreview] = useState(true);

  return (
    <div className="space-y-4">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          Preview
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            className="p-2"
          >
            {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button variant="default" size="sm" onClick={onSendEmail}>
            <Mail className="h-4 w-4 mr-2" />
            Send Email
          </Button>
        </div>
      </div>

      {showPreview && (
        <Card className="p-0 overflow-hidden shadow-lg">
          <div className="bg-white text-black p-8" style={{ fontFamily: 'Arial, sans-serif' }}>
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center gap-4">
                {invoiceData.companyLogo && (
                  <div className="shrink-0">
                    <img 
                      src={invoiceData.companyLogo} 
                      alt="Company Logo" 
                      className="h-20 w-20 object-contain border border-gray-200 rounded-lg p-2"
                    />
                  </div>
                )}
                <div>
                  <h1 className="text-3xl font-bold text-blue-600 mb-2">
                    {invoiceData.companyName || "Your Company Name"}
                  </h1>
                  {invoiceData.companyAddress && (
                    <div className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">
                      {invoiceData.companyAddress}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-4xl font-bold text-gray-800 mb-3">INVOICE</h2>
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex justify-end">
                    <span className="font-medium w-20">Invoice #:</span>
                    <span>{invoiceData.invoiceNumber || "INV-001"}</span>
                  </div>
                  {invoiceData.poNumber && (
                    <div className="flex justify-end">
                      <span className="font-medium w-20">PO #:</span>
                      <span>{invoiceData.poNumber}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bill To & Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wide">Bill To:</h3>
                <div className="text-sm">
                  <div className="font-semibold text-lg text-gray-800 mb-2">
                    {invoiceData.clientName || "Client Name"}
                  </div>
                  {invoiceData.clientEmail && (
                    <div className="text-gray-600 mb-1">{invoiceData.clientEmail}</div>
                  )}
                  {invoiceData.clientAddress && (
                    <div className="text-gray-600 whitespace-pre-line leading-relaxed">
                      {invoiceData.clientAddress}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm space-y-2">
                  <div className="flex justify-end">
                    <span className="font-medium w-24">Invoice Date:</span>
                    <span className="text-gray-600">{invoiceData.invoiceDate || "Not set"}</span>
                  </div>
                  {invoiceData.dueDate && (
                    <div className="flex justify-end">
                      <span className="font-medium w-24">Due Date:</span>
                      <span className="text-gray-600">{invoiceData.dueDate}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="mb-8">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-300 bg-gray-50">
                      <th className="text-left py-4 px-4 font-bold text-gray-800">Description</th>
                      <th className="text-center py-4 px-4 font-bold text-gray-800 w-20">Qty</th>
                      <th className="text-right py-4 px-4 font-bold text-gray-800 w-28">Rate</th>
                      <th className="text-right py-4 px-4 font-bold text-gray-800 w-32">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceData.lineItems.length > 0 ? (
                      invoiceData.lineItems.map((item, index) => (
                        <tr key={item.id} className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                          <td className="py-4 px-4 text-gray-800 font-medium">
                            {item.description || "Item description"}
                          </td>
                          <td className="py-4 px-4 text-center text-gray-600 font-medium">
                            {item.quantity}
                          </td>
                          <td className="py-4 px-4 text-right text-gray-600 font-medium">
                            ${item.price.toFixed(2)}
                          </td>
                          <td className="py-4 px-4 text-right font-bold text-gray-800">
                            ${item.amount.toFixed(2)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-gray-400 italic text-lg">
                          No items added yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals */}
            {invoiceData.lineItems.length > 0 && (
              <div className="flex justify-end mb-8">
                <div className="w-80">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600 font-medium">Subtotal:</span>
                      <span className="font-semibold text-gray-800">${invoiceData.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600 font-medium">Tax (10%):</span>
                      <span className="font-semibold text-gray-800">${invoiceData.salesTax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-4 border-b-2 border-gray-400">
                      <span className="font-bold text-xl text-gray-800">Total:</span>
                      <span className="font-bold text-xl text-blue-600">${invoiceData.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="mt-12 pt-8 border-t-2 border-gray-200">
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-800 mb-2">
                  Thank you for your business!
                </div>
                <div className="text-sm text-gray-500">
                  This invoice was generated with EaseInvoice
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {!showPreview && (
        <Card className="p-8 text-center border-dashed">
          <div className="text-gray-500">
            <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Preview hidden</p>
            <p className="text-sm">Click the eye icon to show preview</p>
          </div>
        </Card>
      )}
    </div>
  );
};