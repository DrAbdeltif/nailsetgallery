import type { APIRoute } from 'astro';

export const prerender = true;

export const GET: APIRoute = async () => {
  const openApiSpec = {
    openapi: '3.0.3',
    info: {
      title: 'Nail Set Gallery API',
      description: 'API services for Nail Set Gallery newsletter subscription and health status',
      version: '1.0.0'
    },
    servers: [
      {
        url: 'https://nailsetgallery.com/api'
      }
    ],
    paths: {
      '/subscribe': {
        post: {
          summary: 'Subscribe email to newsletter',
          operationId: 'subscribeEmail',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    email: {
                      type: 'string',
                      format: 'email'
                    },
                    source: {
                      type: 'string'
                    }
                  },
                  required: ['email']
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Successfully subscribed'
            },
            '400': {
              description: 'Invalid email address'
            }
          }
        }
      },
      '/health': {
        get: {
          summary: 'Health check endpoint',
          operationId: 'healthCheck',
          responses: {
            '200': {
              description: 'API is operational'
            }
          }
        }
      }
    }
  };

  return new Response(JSON.stringify(openApiSpec, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.oai.openapi+json;version=3.0',
      'Access-Control-Allow-Origin': '*'
    }
  });
};
