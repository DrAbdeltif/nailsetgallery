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

    // Optional webhook forwarding to Email Service Provider (Mailchimp, ConvertKit, Brevo, Resend, etc.)
    const webhookUrl = import.meta.env.NEWSLETTER_WEBHOOK_URL || process.env.NEWSLETTER_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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
