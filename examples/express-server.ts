import { AlmostNodeContainer } from '../src/types/index.js';

export async function createExpressServer(container: AlmostNodeContainer) {
  const mockExpress = (handler?: (req: any, res: any) => Promise<Response>) => {
    const routes: { [key: string]: (req: any) => Promise<Response> } = {};

    const app = {
      get: (path: string, handler: (req: any, res: any) => Promise<Response>) => {
        routes[`GET:${path}`] = handler;
      },
      post: (path: string, handler: (req: any, res: any) => Promise<Response>) => {
        routes[`POST:${path}`] = handler;
      },
      put: (path: string, handler: (req: any, res: any) => Promise<Response>) => {
        routes[`PUT:${path}`] = handler;
      },
      delete: (path: string, handler: (req: any, res: any) => Promise<Response>) => {
        routes[`DELETE:${path}`] = handler;
      },
      use: (middleware: any) => {
        console.log('Middleware registered');
      },
      listen: (port: number, callback?: () => void) => {
        console.log(`Server listening on port ${port}`);
        if (callback) {
          callback();
        }
      },
    };

    container.serverBridge.createServer(async (req: Request) => {
      const method = req.method;
      const url = new URL(req.url);
      const path = url.pathname;
      const key = `${method}:${path}`;

      if (routes[key]) {
        const res = {
          status: (code: number) => ({
            json: (data: any) =>
              new Response(JSON.stringify(data), {
                status: code,
                headers: { 'Content-Type': 'application/json' },
              }),
            send: (data: any) => new Response(data, { status: code }),
          }),
        };
        return routes[key](req, res);
      }

      return new Response('Not Found', { status: 404 });
    });

    return app;
  };

  return mockExpress;
}

export async function createSimpleServer(container: AlmostNodeContainer) {
  container.serverBridge.route('/api/hello', async (req: Request) => {
    return new Response(JSON.stringify({ message: 'Hello from AlmostNode!' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  });

  container.serverBridge.route('/api/echo', async (req: Request) => {
    const body = await req.text();
    return new Response(body, {
      headers: { 'Content-Type': 'application/json' },
    });
  });
}
