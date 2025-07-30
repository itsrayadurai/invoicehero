import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InvoiceData {
  companyName: string;
  companyAddress: string;
  companyLogo?: string;
  clientName: string;
  clientAddress: string;
  invoiceNumber: string;
  poNumber?: string;
  invoiceDate: string;
  dueDate?: string;
  lineItems: Array<{
    name: string;
    quantity: number;
    rate: number;
    total: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
}

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    const { invoiceData, userId, saveToDatabase = false }: { 
      invoiceData: InvoiceData, 
      userId?: string, 
      saveToDatabase?: boolean 
    } = await req.json();

    console.log('Generating PDF for invoice:', invoiceData.invoiceNumber);

    // Generate HTML for PDF conversion
    const htmlContent = generateInvoiceHTML(invoiceData);

    // For now, we'll return the HTML content and indicate that PDF generation is ready
    // In a full implementation, you would use a library like Puppeteer or jsPDF
    // to convert HTML to PDF
    
    let invoiceId = null;
    if (saveToDatabase && userId) {
      // Save invoice to database
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          user_id: userId,
          invoice_number: invoiceData.invoiceNumber,
          po_number: invoiceData.poNumber,
          client_name: invoiceData.clientName,
          client_address: invoiceData.clientAddress,
          invoice_date: invoiceData.invoiceDate,
          due_date: invoiceData.dueDate,
          subtotal: invoiceData.subtotal,
          tax: invoiceData.tax,
          total: invoiceData.total,
          company_logo_url: invoiceData.companyLogo,
          notes: invoiceData.notes,
          status: 'draft'
        })
        .select()
        .single();

      if (invoiceError) {
        console.error('Error saving invoice:', invoiceError);
        throw new Error('Failed to save invoice');
      }

      invoiceId = invoice.id;

      // Save line items
      const lineItemsData = invoiceData.lineItems.map((item, index) => ({
        invoice_id: invoiceId,
        name: item.name,
        quantity: item.quantity,
        rate: item.rate,
        total: item.total,
        sort_order: index
      }));

      const { error: lineItemsError } = await supabase
        .from('line_items')
        .insert(lineItemsData);

      if (lineItemsError) {
        console.error('Error saving line items:', lineItemsError);
        throw new Error('Failed to save line items');
      }
    }

    console.log('Successfully generated invoice HTML');

    return new Response(JSON.stringify({
      success: true,
      htmlContent: htmlContent,
      invoiceId: invoiceId,
      message: 'HTML generated successfully. PDF conversion requires additional setup.'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in generate-pdf function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateInvoiceHTML(data: InvoiceData): string {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Invoice ${data.invoiceNumber}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
        .invoice-header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 40px; }
        .company-info { display: flex; align-items: center; gap: 15px; }
        .company-logo { max-width: 80px; max-height: 80px; }
        .company-details h1 { margin: 0; font-size: 24px; color: #3b82f6; }
        .invoice-title { text-align: right; }
        .invoice-title h2 { margin: 0; font-size: 36px; color: #374151; }
        .invoice-meta { margin-top: 10px; font-size: 14px; color: #6b7280; }
        .billing-info { display: flex; justify-content: space-between; margin-bottom: 40px; }
        .bill-to { flex: 1; }
        .invoice-details { text-align: right; flex: 1; }
        .bill-to h3, .invoice-details h3 { margin: 0 0 10px 0; font-size: 16px; color: #374151; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .items-table th { background-color: #f3f4f6; padding: 12px; text-align: left; border-bottom: 2px solid #d1d5db; }
        .items-table td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
        .items-table .text-right { text-align: right; }
        .totals { margin-left: auto; width: 300px; }
        .totals .row { display: flex; justify-content: space-between; padding: 8px 0; }
        .totals .total-row { font-weight: bold; font-size: 18px; border-top: 2px solid #374151; padding-top: 12px; color: #3b82f6; }
        .footer { margin-top: 50px; text-align: center; font-size: 14px; color: #6b7280; }
    </style>
</head>
<body>
    <div class="invoice-header">
        <div class="company-info">
            ${data.companyLogo ? `<img src="${data.companyLogo}" alt="Company Logo" class="company-logo">` : ''}
            <div class="company-details">
                <h1>${data.companyName || 'Your Company'}</h1>
                <div>${data.companyAddress ? data.companyAddress.replace(/\n/g, '<br>') : ''}</div>
            </div>
        </div>
        <div class="invoice-title">
            <h2>INVOICE</h2>
            <div class="invoice-meta">
                <div>Invoice #: ${data.invoiceNumber}</div>
                ${data.poNumber ? `<div>PO #: ${data.poNumber}</div>` : ''}
            </div>
        </div>
    </div>

    <div class="billing-info">
        <div class="bill-to">
            <h3>Bill To:</h3>
            <div><strong>${data.clientName || 'Client Name'}</strong></div>
            <div>${data.clientAddress ? data.clientAddress.replace(/\n/g, '<br>') : ''}</div>
        </div>
        <div class="invoice-details">
            <div><strong>Invoice Date:</strong> ${data.invoiceDate}</div>
            ${data.dueDate ? `<div><strong>Due Date:</strong> ${data.dueDate}</div>` : ''}
        </div>
    </div>

    <table class="items-table">
        <thead>
            <tr>
                <th>Description</th>
                <th class="text-right">Qty</th>
                <th class="text-right">Rate</th>
                <th class="text-right">Amount</th>
            </tr>
        </thead>
        <tbody>
            ${data.lineItems.map(item => `
                <tr>
                    <td>${item.name}</td>
                    <td class="text-right">${item.quantity}</td>
                    <td class="text-right">$${item.rate.toFixed(2)}</td>
                    <td class="text-right">$${item.total.toFixed(2)}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>

    <div class="totals">
        <div class="row">
            <span>Subtotal:</span>
            <span>$${data.subtotal.toFixed(2)}</span>
        </div>
        <div class="row">
            <span>Tax:</span>
            <span>$${data.tax.toFixed(2)}</span>
        </div>
        <div class="row total-row">
            <span>Total:</span>
            <span>$${data.total.toFixed(2)}</span>
        </div>
    </div>

    ${data.notes ? `<div class="footer">${data.notes}</div>` : ''}
    
    <div class="footer">
        <p>Thank you for your business!</p>
    </div>
</body>
</html>`;
}