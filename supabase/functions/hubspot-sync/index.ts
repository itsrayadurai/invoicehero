import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const hubspotToken = Deno.env.get("HUBSPOT_ACCESS_TOKEN");
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface HubSpotSyncRequest {
  invoiceId: string;
  action: 'create_contact' | 'create_deal' | 'log_activity' | 'sync_all';
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

    const { invoiceId, action }: HubSpotSyncRequest = await req.json();

    if (!invoiceId || !action) {
      throw new Error('Missing required fields: invoiceId and action');
    }

    // Get invoice data
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select(`
        *,
        line_items (*)
      `)
      .eq('id', invoiceId)
      .eq('user_id', user.id)
      .single();

    if (invoiceError || !invoice) {
      throw new Error('Invoice not found or access denied');
    }

    let result = {};

    switch (action) {
      case 'create_contact':
        result = await createHubSpotContact(invoice);
        break;
      case 'create_deal':
        result = await createHubSpotDeal(invoice);
        break;
      case 'log_activity':
        result = await logHubSpotActivity(invoice);
        break;
      case 'sync_all':
        const contact = await createHubSpotContact(invoice);
        const deal = await createHubSpotDeal(invoice, contact.contactId);
        const activity = await logHubSpotActivity(invoice, deal.dealId);
        result = { contact, deal, activity };
        break;
      default:
        throw new Error('Invalid action specified');
    }

    return new Response(JSON.stringify({
      success: true,
      data: result,
      message: `HubSpot ${action} completed successfully`
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in hubspot-sync function:", error);
    return new Response(
      JSON.stringify({
        error: error.message || 'HubSpot sync failed',
        success: false
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

async function createHubSpotContact(invoice: any) {
  const contactData = {
    properties: {
      email: invoice.client_email,
      firstname: invoice.client_name.split(' ')[0] || '',
      lastname: invoice.client_name.split(' ').slice(1).join(' ') || '',
      company: invoice.client_name,
      address: invoice.client_address || '',
      phone: '', // Add if you have this field
      lifecyclestage: 'customer',
      lead_status: 'NEW'
    }
  };

  const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${hubspotToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(contactData),
  });

  if (!response.ok) {
    // If contact already exists, try to find it
    if (response.status === 409) {
      const searchResponse = await fetch(
        `https://api.hubapi.com/crm/v3/objects/contacts/search`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${hubspotToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            filterGroups: [
              {
                filters: [
                  {
                    propertyName: 'email',
                    operator: 'EQ',
                    value: invoice.client_email
                  }
                ]
              }
            ]
          }),
        }
      );

      if (searchResponse.ok) {
        const searchResult = await searchResponse.json();
        if (searchResult.results && searchResult.results.length > 0) {
          return { contactId: searchResult.results[0].id, existing: true };
        }
      }
    }
    throw new Error(`Failed to create/find HubSpot contact: ${response.statusText}`);
  }

  const contactResult = await response.json();
  return { contactId: contactResult.id, existing: false };
}

async function createHubSpotDeal(invoice: any, contactId?: string) {
  const dealData = {
    properties: {
      dealname: `Invoice ${invoice.invoice_number} - ${invoice.client_name}`,
      amount: invoice.total.toString(),
      dealstage: 'presentationscheduled', // Adjust based on your pipeline
      pipeline: 'default', // Adjust based on your HubSpot setup
      closedate: invoice.due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      hubspot_owner_id: '', // Set if you have a specific owner
      dealtype: 'newbusiness',
      description: `Invoice ${invoice.invoice_number} for ${invoice.client_name}. Total amount: $${invoice.total}`
    },
    associations: contactId ? [
      {
        to: { id: contactId },
        types: [
          {
            associationCategory: "HUBSPOT_DEFINED",
            associationTypeId: 3 // Contact to Deal association
          }
        ]
      }
    ] : []
  };

  const response = await fetch('https://api.hubapi.com/crm/v3/objects/deals', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${hubspotToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dealData),
  });

  if (!response.ok) {
    throw new Error(`Failed to create HubSpot deal: ${response.statusText}`);
  }

  const dealResult = await response.json();
  
  // Update invoice with HubSpot deal ID
  await supabase
    .from('invoices')
    .update({ hubspot_deal_id: dealResult.id })
    .eq('id', invoice.id);

  return { dealId: dealResult.id };
}

async function logHubSpotActivity(invoice: any, dealId?: string) {
  const activityData = {
    properties: {
      hs_timestamp: new Date().toISOString(),
      hs_activity_type: 'EMAIL',
      hs_body_preview: `Invoice ${invoice.invoice_number} sent to ${invoice.client_name}`,
      hubspot_owner_id: '', // Set if you have a specific owner
    },
    associations: dealId ? [
      {
        to: { id: dealId },
        types: [
          {
            associationCategory: "HUBSPOT_DEFINED",
            associationTypeId: 214 // Activity to Deal association
          }
        ]
      }
    ] : []
  };

  const response = await fetch('https://api.hubapi.com/crm/v3/objects/activities/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${hubspotToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(activityData),
  });

  if (!response.ok) {
    throw new Error(`Failed to log HubSpot activity: ${response.statusText}`);
  }

  const activityResult = await response.json();
  return { activityId: activityResult.id };
}

serve(handler);