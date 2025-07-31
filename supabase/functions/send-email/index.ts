import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  invoiceId: string;
  clientEmail: string;
  clientName: string;
  invoiceNumber: string;
  pdfUrl?: string;
  customMessage?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get user from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Invalid authorization token');
    }

    const { 
      invoiceId, 
      clientEmail, 
      clientName, 
      invoiceNumber, 
      pdfUrl, 
      customMessage 
    }: EmailRequest = await req.json();

    // Validate required fields
    if (!invoiceId || !clientEmail || !clientName || !invoiceNumber) {
      throw new Error('Missing required fields');
    }

    // Get user profile for sender info
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, company_name, email')
      .eq('user_id', user.id)
      .single();

    const senderName = profile?.display_name || 'Invoice Team';
    const companyName = profile?.company_name || 'Your Company';
    const senderEmail = profile?.email || user.email;

    // Prepare email content
    const subject = `Invoice ${invoiceNumber} from ${companyName}`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Invoice ${invoiceNumber}</h2>
        
        <p>Dear ${clientName},</p>
        
        <p>${customMessage || `Please find attached your invoice ${invoiceNumber}. We appreciate your business and look forward to working with you.`}</p>
        
        ${pdfUrl ? `<p><a href="${pdfUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Download Invoice PDF</a></p>` : ''}
        
        <p>If you have any questions about this invoice, please don't hesitate to contact us.</p>
        
        <p>Best regards,<br>
        ${senderName}<br>
        ${companyName}</p>
        
        <hr style="border: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #666;">
          This email was sent from ${companyName}. If you have any questions, please reply to this email or contact us at ${senderEmail}.
        </p>
      </div>
    `;

    // Send email
    const emailResponse = await resend.emails.send({
      from: `${senderName} <onboarding@resend.dev>`, // Change this to your verified domain
      to: [clientEmail],
      subject: subject,
      html: htmlContent,
      replyTo: senderEmail || undefined,
    });

    console.log("Email sent successfully:", emailResponse);

    // Update invoice status to 'sent'
    const { error: updateError } = await supabase
      .from('invoices')
      .update({ 
        status: 'sent',
        updated_at: new Date().toISOString()
      })
      .eq('id', invoiceId)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error updating invoice status:', updateError);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      emailId: emailResponse.data?.id,
      message: 'Invoice email sent successfully'
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in send-email function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to send email',
        success: false
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);