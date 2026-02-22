import { ServerBridge, ServerConfig } from '../types/index.js';

interface RouteHandler {
  pattern: RegExp;
  handler: (req: Request) => Promise<Response>;
}

export class ServerBridgeImpl implements ServerBridge {
  private routes: RouteHandler[] = [];
  private config: ServerConfig;

  constructor(_runtime: unknown, _fs: unknown, config?: ServerConfig) {
    this.config = config || { port: 3000, host: 'localhost', cors: true };
  }

  createServer(handler: (req: Request) => Promise<Response>): void {
    if (typeof globalThis !== 'undefined' && 'addEventListener' in globalThis) {
      globalThis.addEventListener('fetch', (event: any) => {
        event.respondWith(handler(event.request));
      });
    }
  }

  route(pattern: string, handler: (req: Request) => Promise<Response>): void {
    const regexPattern = this.patternToRegex(pattern);
    this.routes.push({
      pattern: regexPattern,
      handler: async (req) => {
        const res = await handler(req);
        return this.addCorsHeaders(res);
      },
    });
  }

  private patternToRegex(pattern: string): RegExp {
    const regexPattern = pattern
      .replace(/\//g, '\\/')
      .replace(/:([a-zA-Z]+)/g, '(?<$1>[^/]+)')
      .replace(/\*/g, '.*');
    return new RegExp(`^${regexPattern}$`);
  }

  private addCorsHeaders(response: Response): Response {
    if (!this.config.cors) {
      return response;
    }

    const newHeaders = new Headers(response.headers);
    newHeaders.set('Access-Control-Allow-Origin', '*');
    newHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    newHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  }

  async handleRequest(req: Request): Promise<Response> {
    const url = new URL(req.url);

    for (const route of this.routes) {
      const match = route.pattern.exec(url.pathname);
      if (match) {
        return route.handler(req);
      }
    }

    return new Response('Not Found', { status: 404 });
  }

  getConfig(): ServerConfig {
    return this.config;
  }

  setConfig(config: ServerConfig): void {
    this.config = { ...this.config, ...config };
  }
}
