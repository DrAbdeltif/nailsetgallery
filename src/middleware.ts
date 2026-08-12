import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const host = context.url.host;
  if (host === 'www.nailsetgallery.com') {
    const targetUrl = new URL(context.url);
    targetUrl.hostname = 'nailsetgallery.com';
    return context.redirect(targetUrl.toString(), 301);
  }

  const response = await next();
  const contentType = response.headers.get('content-type') || '';

  // Attach Link headers for agent discovery on HTML responses per RFC 8288 and RFC 9727
  if (contentType.includes('text/html') || context.url.pathname === '/' || context.url.pathname === '') {
    const newHeaders = new Headers(response.headers);
    newHeaders.set(
      'Link',
      '</.well-known/api-catalog>; rel="api-catalog", </sitemap-index.xml>; rel="sitemap", </rss.xml>; rel="alternate"; type="application/rss+xml"'
    );
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  }

  return response;
});
