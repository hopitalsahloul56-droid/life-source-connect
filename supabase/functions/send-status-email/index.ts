import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, firstName, lastName, status, appointmentDate, language }: EmailRequest = await req.json();

    console.log("Sending email to:", email, "Status:", status, "Language:", language);

    if (!email) {
      console.log("No email provided, skipping notification");
      return new Response(JSON.stringify({ success: true, message: "No email to send to" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
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
      console.error("Resend API error:", errorText);
      throw new Error(`Resend API error: ${res.status}`);
    }

    const emailResponse = await res.json();

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
