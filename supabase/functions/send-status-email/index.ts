import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  email: string;
  firstName: string;
  lastName: string;
  status: 'approved' | 'rejected';
  appointmentDate?: string;
  language: 'fr' | 'ar';
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify admin authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('Missing or invalid authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify the token and get user claims
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      console.log('Invalid token');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claimsData.claims.sub;

    // Verify user is admin using service role
    const supabaseService = createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: profile, error: profileError } = await supabaseService
      .from('profiles')
      .select('is_admin')
      .eq('user_id', userId)
      .single();

    if (profileError || !profile?.is_admin) {
      console.log('User is not an admin');
      return new Response(
        JSON.stringify({ error: 'Forbidden: Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Admin authenticated, processing email request');

    const { email, firstName, lastName, status, appointmentDate, language }: EmailRequest = await req.json();

    // Validate email format
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      console.log('Invalid or missing email');
      return new Response(JSON.stringify({ success: true, message: "Invalid email, skipping" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Validate other required fields
    if (!firstName || !lastName || !status || !language) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      if (language === 'ar') {
        return date.toLocaleDateString('ar-TN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      }
      return date.toLocaleDateString('fr-TN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    let subject: string;
    let htmlContent: string;

    if (language === 'ar') {
      if (status === 'approved') {
        subject = "تم قبول طلب التبرع بالدم الخاص بك";
        htmlContent = `
          <div dir="rtl" style="font-family: 'Tajawal', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">تبرع بالحياة</h1>
            </div>
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 16px 16px;">
              <h2 style="color: #22c55e; margin-bottom: 20px;">🎉 تم قبول طلبك!</h2>
              <p style="font-size: 16px; color: #374151;">عزيزي/عزيزتي ${firstName} ${lastName}،</p>
              <p style="font-size: 16px; color: #374151;">يسعدنا إبلاغك بأن طلب التبرع بالدم الخاص بك قد تم قبوله.</p>
              ${appointmentDate ? `
                <div style="background: #dcfce7; padding: 20px; border-radius: 12px; margin: 20px 0; text-align: center;">
                  <p style="color: #166534; font-weight: bold; margin: 0;">موعدك المحدد:</p>
                  <p style="color: #166534; font-size: 18px; margin: 10px 0 0 0;">${formatDate(appointmentDate)}</p>
                </div>
              ` : ''}
              <p style="font-size: 16px; color: #374151;">نشكرك على كرمك. تبرعك سينقذ الأرواح!</p>
              <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">مع أطيب التحيات،<br>فريق تبرع بالحياة</p>
            </div>
          </div>
        `;
      } else {
        subject = "بخصوص طلب التبرع بالدم الخاص بك";
        htmlContent = `
          <div dir="rtl" style="font-family: 'Tajawal', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">تبرع بالحياة</h1>
            </div>
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 16px 16px;">
              <h2 style="color: #dc2626; margin-bottom: 20px;">تحديث حول طلبك</h2>
              <p style="font-size: 16px; color: #374151;">عزيزي/عزيزتي ${firstName} ${lastName}،</p>
              <p style="font-size: 16px; color: #374151;">نشكرك على اهتمامك بالتبرع بالدم. للأسف، لا يمكننا قبول طلبك في الوقت الحالي.</p>
              <p style="font-size: 16px; color: #374151;">قد يكون ذلك بسبب عوامل أهلية مؤقتة. لا تتردد في تقديم طلب جديد في المستقبل.</p>
              <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">مع أطيب التحيات،<br>فريق تبرع بالحياة</p>
            </div>
          </div>
        `;
      }
    } else {
      if (status === 'approved') {
        subject = "Votre demande de don de sang a été acceptée";
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">Don de Vie</h1>
            </div>
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 16px 16px;">
              <h2 style="color: #22c55e; margin-bottom: 20px;">🎉 Votre demande a été acceptée !</h2>
              <p style="font-size: 16px; color: #374151;">Cher(e) ${firstName} ${lastName},</p>
              <p style="font-size: 16px; color: #374151;">Nous avons le plaisir de vous informer que votre demande de don de sang a été acceptée.</p>
              ${appointmentDate ? `
                <div style="background: #dcfce7; padding: 20px; border-radius: 12px; margin: 20px 0; text-align: center;">
                  <p style="color: #166534; font-weight: bold; margin: 0;">Votre rendez-vous :</p>
                  <p style="color: #166534; font-size: 18px; margin: 10px 0 0 0;">${formatDate(appointmentDate)}</p>
                </div>
              ` : ''}
              <p style="font-size: 16px; color: #374151;">Merci pour votre générosité. Votre don sauvera des vies !</p>
              <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">Cordialement,<br>L'équipe Don de Vie</p>
            </div>
          </div>
        `;
      } else {
        subject = "Concernant votre demande de don de sang";
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">Don de Vie</h1>
            </div>
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 16px 16px;">
              <h2 style="color: #dc2626; margin-bottom: 20px;">Mise à jour de votre demande</h2>
              <p style="font-size: 16px; color: #374151;">Cher(e) ${firstName} ${lastName},</p>
              <p style="font-size: 16px; color: #374151;">Nous vous remercions de votre intérêt pour le don de sang. Malheureusement, nous ne pouvons pas accepter votre demande pour le moment.</p>
              <p style="font-size: 16px; color: #374151;">Cela peut être dû à des facteurs d'éligibilité temporaires. N'hésitez pas à soumettre une nouvelle demande à l'avenir.</p>
              <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">Cordialement,<br>L'équipe Don de Vie</p>
            </div>
          </div>
        `;
      }
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Don de Vie <onboarding@resend.dev>",
        to: [email],
        subject: subject,
        html: htmlContent,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Email API error, status:", res.status);
      throw new Error(`Email API error: ${res.status}`);
    }

    const emailResponse = await res.json();
    console.log("Email sent successfully");

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error processing request:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
