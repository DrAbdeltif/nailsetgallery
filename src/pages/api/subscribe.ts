import type { APIRoute } from 'astro';

export const prerender = false;

interface SubscribePayload {
  email?: string;
  b_hp_email?: string;
  source?: string;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    let email = '';
    let honeypot = '';
    let source = 'website';

    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const data: SubscribePayload = await request.json();
      email = data.email?.trim() || '';
      honeypot = data.b_hp_email?.trim() || '';
      source = data.source?.trim() || 'website';
    } else if (contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      email = (formData.get('email') as string || '').trim();
      honeypot = (formData.get('b_hp_email') as string || '').trim();
      source = (formData.get('source') as string || '').trim() || 'website';
    }

    // Anti-spam Honeypot Check
    if (honeypot !== '') {
      // Silent success response to deceive bots
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Subscription confirmed!',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Please enter a valid email address.',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // ── Brevo (Sendinblue) API Integration ──
    const brevoApiKey = import.meta.env.BREVO_API_KEY || process.env.BREVO_API_KEY;
    const brevoListId = Number(import.meta.env.BREVO_LIST_ID || process.env.BREVO_LIST_ID) || undefined;

    if (brevoApiKey) {
      try {
        const brevoPayload: Record<string, any> = {
          email,
          updateEnabled: true,
        };

        if (brevoListId && !isNaN(brevoListId)) {
          brevoPayload.listIds = [brevoListId];
        }

        let brevoRes = await fetch('https://api.brevo.com/v3/contacts', {
          method: 'POST',
          headers: {
            'api-key': brevoApiKey,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(brevoPayload),
        });

        // If Brevo returns an error, try without attributes (if any were passed) or log detailed diagnosis
        if (!brevoRes.ok && brevoRes.status !== 204) {
          const errData = await brevoRes.json().catch(() => ({}));
          console.error('Brevo API subscription error details:', {
            status: brevoRes.status,
            statusText: brevoRes.statusText,
            error: errData,
          });
        } else {
          console.log(`[Brevo] Successfully added/updated contact: ${email}`);
        }
      } catch (brevoErr) {
        console.error('Brevo dispatch exception:', brevoErr);
      }
    } else {
      console.warn('[Brevo] No BREVO_API_KEY found in environment variables.');
    }

    // ── Generic Webhook Fallback ──
    const webhookUrl = import.meta.env.NEWSLETTER_WEBHOOK_URL || process.env.NEWSLETTER_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          redirect: 'follow',
          body: JSON.stringify({
            email,
            source,
            subscribed_at: new Date().toISOString(),
          }),
        });
      } catch (webhookErr) {
        console.error('Webhook dispatch error:', webhookErr);
      }
    }

    // Return successful response payload
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Thank you for subscribing! Check your inbox for your first nail trend guide.',
        email,
        subscribedAt: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Subscription error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'An unexpected error occurred. Please try again later.',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
