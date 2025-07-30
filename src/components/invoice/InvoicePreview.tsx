import { Card } from "@/components/ui/card";
import { InvoiceData } from "@/pages/CreateInvoice";

interface InvoicePreviewProps {
  invoiceData: InvoiceData;
}

export const InvoicePreview = ({ invoiceData }: InvoicePreviewProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Preview</h2>
      
      <div className="bg-white border shadow-sm rounded-lg p-8 text-black" style={{ fontFamily: 'Arial, sans-serif' }}>
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center gap-4">
            {invoiceData.companyLogo && (
              <img 
                src={invoiceData.companyLogo} 
                alt="Company Logo" 
                className="h-16 w-16 object-contain"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold text-primary">{invoiceData.companyName || "Your Company"}</h1>
              <div className="text-sm text-gray-600 whitespace-pre-line">
                {invoiceData.companyAddress}
              </div>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-3xl font-bold text-gray-800">INVOICE</h2>
            <div className="text-sm text-gray-600 mt-2">
              <div>Invoice #: {invoiceData.invoiceNumber}</div>
              {invoiceData.poNumber && <div>PO #: {invoiceData.poNumber}</div>}
            </div>
          </div>
        </div>

        {/* Bill To & Dates */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Bill To:</h3>
            <div className="text-sm">
              <div className="font-medium">{invoiceData.clientName || "Client Name"}</div>
              <div className="text-gray-600 whitespace-pre-line">
                {invoiceData.clientAddress}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm space-y-1">
              <div>
                <span className="font-medium">Invoice Date:</span> {invoiceData.invoiceDate}
              </div>
              {invoiceData.dueDate && (
                <div>
                  <span className="font-medium">Due Date:</span> {invoiceData.dueDate}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="mb-8">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left py-3 font-semibold text-gray-800">Description</th>
                <th className="text-center py-3 font-semibold text-gray-800 w-20">Qty</th>
                <th className="text-right py-3 font-semibold text-gray-800 w-24">Rate</th>
                <th className="text-right py-3 font-semibold text-gray-800 w-24">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.lineItems.length > 0 ? (
                invoiceData.lineItems.map((item) => (
                  <tr key={item.id} className="border-b border-gray-200">
                    <td className="py-3 text-gray-800">{item.name || "Item description"}</td>
                    <td className="py-3 text-center text-gray-600">{item.quantity}</td>
                    <td className="py-3 text-right text-gray-600">${item.rate.toFixed(2)}</td>
                    <td className="py-3 text-right font-medium text-gray-800">${item.total.toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-500 italic">
                    No items added yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        {invoiceData.lineItems.length > 0 && (
          <div className="flex justify-end">
            <div className="w-64">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">${invoiceData.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Tax (10%):</span>
                <span className="font-medium">${invoiceData.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-3 border-b-2 border-gray-300">
                <span className="font-semibold text-lg text-gray-800">Total:</span>
                <span className="font-bold text-lg text-primary">${invoiceData.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="text-sm text-gray-600 text-center">
            Thank you for your business!
          </div>
        </div>
      </div>
    </div>
  );
};