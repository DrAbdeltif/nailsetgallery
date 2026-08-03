import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const prerender = false;

const INDEXNOW_KEY = '47a28e9d30f443b78912e750c184c8a2';
const HOST = 'nailsetgallery.com';

export const GET: APIRoute = async () => {
  const posts = await getCollection('blog', ({ data }) => !data.draft);

  const staticPages = [
    '/',
    '/blog/',
    '/colors/',
    '/styles/',
    '/seasons/',
    '/trends/',
    '/tutorials/',
    '/quiz/',
    '/about/',
    '/contact/',
  ];

  const blogPages = posts.map((post) => `/blog/${post.id}/`);
  const allUrls = [...staticPages, ...blogPages].map((path) => `https://${HOST}${path}`);

  const payload = {
    host: HOST,
    key: INDEXNOW_KEY,
    keyLocation: `https://${HOST}/${INDEXNOW_KEY}.txt`,
    urlList: allUrls,
  };

  return new Response(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};

export const POST: APIRoute = async () => {
  const posts = await getCollection('blog', ({ data }) => !data.draft);

  const staticPages = [
    '/',
    '/blog/',
    '/colors/',
    '/styles/',
    '/seasons/',
    '/trends/',
    '/tutorials/',
    '/quiz/',
    '/about/',
    '/contact/',
  ];

  const blogPages = posts.map((post) => `/blog/${post.id}/`);
  const allUrls = [...staticPages, ...blogPages].map((path) => `https://${HOST}${path}`);

  const payload = {
    host: HOST,
    key: INDEXNOW_KEY,
    keyLocation: `https://${HOST}/${INDEXNOW_KEY}.txt`,
    urlList: allUrls,
  };

  try {
    const bingRes = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(payload),
    });

    return new Response(
      JSON.stringify({
        success: bingRes.ok,
        status: bingRes.status,
        submittedUrlCount: allUrls.length,
      }),
      {
        status: bingRes.ok ? 200 : 502,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: err?.message || 'Failed to submit to IndexNow',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
