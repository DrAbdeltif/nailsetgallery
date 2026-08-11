// WebMCP (Web Model Context Protocol) AI Discovery Client Script

interface WebMCPTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  execute: (params?: Record<string, unknown>) => Promise<unknown>;
}

declare global {
  interface Navigator {
    modelContext?: {
      tools?: WebMCPTool[];
      provideContext?: (ctx: { tools: WebMCPTool[] }) => void;
      registerTool?: (tool: WebMCPTool) => void;
    };
  }
}

export function initWebMCP() {
  if (typeof window === 'undefined') return;
  if (!navigator.modelContext) {
    navigator.modelContext = {};
  }

  const registeredTools: WebMCPTool[] = [
    {
      name: 'search_nail_gallery',
      description: 'Search nail set styles, colors, trends, and tutorials in NailSet Gallery',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search term (e.g. chrome, french tip, glazed, autumn colors)' }
        },
        required: ['query']
      },
      execute: function(params?: Record<string, unknown>) {
        const q = params && typeof params.query === 'string' ? encodeURIComponent(params.query) : '';
        window.location.href = '/blog/?search=' + q;
        return Promise.resolve({ success: true, query: params ? params.query : '' });
      }
    },
    {
      name: 'subscribe_newsletter',
      description: 'Subscribe an email address to the NailSet Gallery weekly nail trend newsletter',
      inputSchema: {
        type: 'object',
        properties: {
          email: { type: 'string', description: 'Email address to subscribe' }
        },
        required: ['email']
      },
      execute: function(params?: Record<string, unknown>) {
        if (!params || typeof params.email !== 'string') return Promise.resolve({ success: false, error: 'Email required' });
        return fetch('/api/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: params.email, source: 'webmcp' })
        }).then((res) => res.json());
      }
    },
    {
      name: 'get_nail_recommendations',
      description: 'Navigate to the interactive Nail Style Finder Quiz',
      inputSchema: {
        type: 'object',
        properties: {}
      },
      execute: function() {
        window.location.href = '/quiz/';
        return Promise.resolve({ success: true, redirect: '/quiz/' });
      }
    },
    {
      name: 'get_trending_nails',
      description: 'Navigate to the current trending nail styles and 2026 nail trend forecasts on NailSet Gallery',
      inputSchema: {
        type: 'object',
        properties: {}
      },
      execute: function() {
        window.location.href = '/trends/';
        return Promise.resolve({ success: true, redirect: '/trends/' });
      }
    },
    {
      name: 'get_nail_by_category',
      description: 'Browse nail content by category: colors, styles, seasons, trends, or tutorials',
      inputSchema: {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            enum: ['colors', 'styles', 'seasons', 'trends', 'tutorials'],
            description: 'Category to browse'
          }
        },
        required: ['category']
      },
      execute: function(params?: Record<string, unknown>) {
        const cat = params && typeof params.category === 'string' ? params.category.toLowerCase().trim() : 'blog';
        const validCats = ['colors', 'styles', 'seasons', 'trends', 'tutorials'];
        const dest = validCats.includes(cat) ? '/' + cat + '/' : '/blog/';
        window.location.href = dest;
        return Promise.resolve({ success: true, redirect: dest, category: cat });
      }
    }
  ];

  const mc = navigator.modelContext;
  if (!mc) return;

  mc.tools = registeredTools;

  if (typeof mc.provideContext === 'function') {
    try {
      mc.provideContext({ tools: registeredTools });
    } catch (e) {}
  }

  if (typeof mc.registerTool === 'function') {
    registeredTools.forEach((tool) => {
      try {
        mc.registerTool?.(tool);
      } catch (e) {}
    });
  }
}


initWebMCP();
document.addEventListener('astro:page-load', initWebMCP);
