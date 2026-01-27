import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StatusResponse {
  found: boolean;
  status?: 'pending' | 'approved' | 'rejected';
  appointment_date?: string | null;
  first_name?: string;
  last_name?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { identity_number } = await req.json();

    // Validate input
    if (!identity_number || typeof identity_number !== 'string') {
      console.log('Invalid request: missing or invalid identity_number');
      return new Response(
        JSON.stringify({ error: 'Identity number is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const trimmedId = identity_number.trim();
    
    // Basic validation - identity number should be numeric and reasonable length
    if (!/^\d{8}$/.test(trimmedId)) {
      console.log('Invalid identity number format:', trimmedId);
      return new Response(
        JSON.stringify({ error: 'Invalid identity number format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Checking donation status for identity number:', trimmedId);

    // Create Supabase client with service role to bypass RLS
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Query only the necessary fields - no PII exposure beyond what's needed
    const { data, error } = await supabase
      .from('donation_requests')
      .select('status, appointment_date, first_name, last_name')
      .eq('identity_number', trimmedId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to check status' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const response: StatusResponse = {
      found: !!data,
    };

    if (data) {
      response.status = data.status;
      response.appointment_date = data.appointment_date;
      response.first_name = data.first_name;
      response.last_name = data.last_name;
      console.log('Found donation request with status:', data.status);
    } else {
      console.log('No donation request found for identity number');
    }

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
