import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FileProcessRequest {
  fileName: string;
  fileType: string;
  fileContent: string; // Base64 encoded content
  userId: string;
}

interface ExtractedData {
  lineItems: Array<{
    name: string;
    quantity: number;
    rate: number;
    description?: string;
  }>;
  clientInfo?: {
    name?: string;
    address?: string;
  };
  invoiceInfo?: {
    invoiceNumber?: string;
    poNumber?: string;
    date?: string;
  };
}

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not found');
    }

    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    const { fileName, fileType, fileContent, userId }: FileProcessRequest = await req.json();

    console.log(`Processing file: ${fileName} of type: ${fileType} for user: ${userId}`);

    // Create file record in database using service role client
    const { data: uploadedFile, error: fileError } = await supabase
      .from('uploaded_files')
      .insert({
        user_id: userId,
        filename: fileName,
        file_type: fileType,
        file_size: Math.round(fileContent.length * 3/4), // Approximate size from base64
        status: 'processing'
      })
      .select()
      .single();

    if (fileError) {
      console.error('Error creating file record:', fileError);
      console.error('Insert data was:', {
        user_id: userId,
        filename: fileName,
        file_type: fileType,
        file_size: Math.round(fileContent.length * 3/4),
        status: 'processing'
      });
      throw new Error(`Failed to create file record: ${fileError.message}`);
    }

    console.log('File record created successfully:', uploadedFile.id);

    let extractedText = '';

    // Process different file types
    if (fileType.startsWith('image/')) {
      // For images, we'll use OCR (simplified version using OpenAI Vision)
      const imageAnalysisResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4.1-2025-04-14',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Extract text content from this image, focusing on any invoice items, quantities, prices, and other business document information.'
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:${fileType};base64,${fileContent}`
                  }
                }
              ]
            }
          ],
          max_tokens: 1000
        }),
      });

      const imageResult = await imageAnalysisResponse.json();
      extractedText = imageResult.choices[0].message.content;
    } else if (fileType === 'application/pdf') {
      // For PDFs, we would normally use pdf-parse or similar
      // For now, we'll simulate PDF text extraction
      const decodedContent = atob(fileContent);
      extractedText = decodedContent; // Simplified - in reality, would use PDF parser
    } else if (fileType === 'text/plain') {
      // For text files, just decode the base64
      extractedText = atob(fileContent);
    } else {
      // For other file types, try to extract as text
      extractedText = atob(fileContent);
    }

    console.log('Extracted text length:', extractedText.length);

    // Use OpenAI to extract structured data from the text
    const structuredExtractionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: `You are an expert at extracting invoice data from documents. Extract structured information from the provided text and return it as JSON.

Focus on extracting:
1. Line items with: name, quantity, rate (unit price), description
2. Client information: name, address
3. Invoice details: invoice number, PO number, date

Return the data in this exact JSON format:
{
  "lineItems": [
    {
      "name": "Item name",
      "quantity": 1,
      "rate": 100.00,
      "description": "Optional description"
    }
  ],
  "clientInfo": {
    "name": "Client name",
    "address": "Client address"
  },
  "invoiceInfo": {
    "invoiceNumber": "INV-001",
    "poNumber": "PO-001", 
    "date": "2024-01-01"
  }
}

If information is missing, omit those fields. For quantities and rates, ensure they are numbers.`
          },
          {
            role: 'user',
            content: `Extract invoice data from this text:\n\n${extractedText}`
          }
        ],
        max_tokens: 2000
      }),
    });

    const extractionResult = await structuredExtractionResponse.json();
    console.log('OpenAI extraction result:', extractionResult);

    let extractedData: ExtractedData;
    try {
      extractedData = JSON.parse(extractionResult.choices[0].message.content);
    } catch (parseError) {
      console.error('Error parsing extracted data:', parseError);
      // Fallback to empty data structure
      extractedData = { lineItems: [] };
    }

    // Update file record with extracted data
    const { error: updateError } = await supabase
      .from('uploaded_files')
      .update({
        status: 'completed',
        extracted_data: extractedData
      })
      .eq('id', uploadedFile.id);

    if (updateError) {
      console.error('Error updating file record:', updateError);
    }

    console.log('Successfully processed file:', fileName);

    return new Response(JSON.stringify({
      success: true,
      fileId: uploadedFile.id,
      extractedData: extractedData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in process-file function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});