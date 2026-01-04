import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SENDPULSE_API_USER_ID = Deno.env.get("SENDPULSE_API_USER_ID");
const SENDPULSE_API_SECRET = Deno.env.get("SENDPULSE_API_SECRET");

async function getSendPulseToken(): Promise<string> {
  console.log("Getting SendPulse access token...");
  
  const response = await fetch("https://api.sendpulse.com/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "client_credentials",
      client_id: SENDPULSE_API_USER_ID,
      client_secret: SENDPULSE_API_SECRET,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Failed to get SendPulse token:", errorText);
    throw new Error(`Failed to get SendPulse token: ${response.status}`);
  }

  const data = await response.json();
  console.log("SendPulse token obtained successfully");
  return data.access_token;
}

async function sendEmail(token: string, profileData: any): Promise<void> {
  console.log("Sending email via SendPulse...");

  const emailHtml = `
    <h1>New AI Visibility Profile Submission</h1>
    <h2>Organization: ${profileData.business_name || "Not provided"}</h2>
    
    <h3>Basic Information</h3>
    <ul>
      <li><strong>Legal Name:</strong> ${profileData.legal_name || "N/A"}</li>
      <li><strong>Website:</strong> ${profileData.business_url || "N/A"}</li>
      <li><strong>Phone:</strong> ${profileData.phone || "N/A"}</li>
      <li><strong>Email:</strong> ${profileData.email || "N/A"}</li>
      <li><strong>Team Size:</strong> ${profileData.team_size || "N/A"}</li>
      <li><strong>Hours:</strong> ${profileData.hours || "N/A"}</li>
    </ul>

    <h3>Primary Location</h3>
    <p>${(profileData.locations || [])[0] ? `${(profileData.locations[0].address_street || '')} ${(profileData.locations[0].address_city || '')}, ${(profileData.locations[0].address_state || '')} ${(profileData.locations[0].address_postal_code || '')}` : 'Not provided'}</p>

    <h3>Description</h3>
    <p><strong>Short:</strong> ${profileData.short_description || "N/A"}</p>
    <p><strong>Long:</strong> ${profileData.long_description || "N/A"}</p>

    <h3>Services</h3>
    <p>${(profileData.services || []).map((s: any) => s.name).join(", ") || "None"}</p>

    <h3>Products</h3>
    <p>${(profileData.products || []).map((p: any) => p.name).join(", ") || "None"}</p>

    <h3>Locations</h3>
    <p>${(profileData.locations || []).length} location(s)</p>

    <h3>Team Members</h3>
    <p>${(profileData.team_members || []).map((t: any) => t.name).join(", ") || "None"}</p>

    <h3>FAQs</h3>
    <p>${(profileData.faqs || []).length} FAQ(s)</p>

    <h3>Articles</h3>
    <p>${(profileData.articles || []).length} article(s)</p>

    <h3>Reviews</h3>
    <p>${(profileData.reviews || []).length} review(s)</p>

    <h3>Awards</h3>
    <p>${(profileData.awards || []).map((a: any) => a.name).join(", ") || "None"}</p>

    <h3>Media Mentions</h3>
    <p>${(profileData.media_mentions || []).length} mention(s)</p>

    <h3>Case Studies</h3>
    <p>${(profileData.case_studies || []).length} case study/studies</p>

    <hr>
    <p><em>Submitted at: ${new Date().toISOString()}</em></p>
  `;

  const response = await fetch("https://api.sendpulse.com/smtp/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: {
        html: emailHtml,
        text: `New AI Visibility Profile submission from ${profileData.business_name || "Unknown"}`,
        subject: `New AI Visibility Profile: ${profileData.business_name || "New Submission"}`,
        from: {
          name: "AI Visibility Profile",
          email: "noreply@aiovisibility.com",
        },
        to: [{ email: "js@aiovisibility.com" }],
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Failed to send email:", errorText);
    throw new Error(`Failed to send email: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  console.log("Email sent successfully:", result);
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify JWT authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header provided");
      return new Response(
        JSON.stringify({ error: "Unauthorized - No authorization header" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("Authentication failed:", authError?.message);
      return new Response(
        JSON.stringify({ error: "Unauthorized - Invalid token" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Authenticated user:", user.id);

    if (!SENDPULSE_API_USER_ID || !SENDPULSE_API_SECRET) {
      throw new Error("SendPulse credentials not configured");
    }

    const profileData = await req.json();
    console.log("Received profile submission for:", profileData.business_name);

    const token = await getSendPulseToken();
    await sendEmail(token, profileData);

    return new Response(
      JSON.stringify({ success: true, message: "Profile sent successfully" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-profile-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});