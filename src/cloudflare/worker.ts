import { AngularAppEngine, createRequestHandler } from '@angular/ssr';

const nodeEnv = (globalThis as unknown as {
  process?: { env?: Record<string, string> };
}).process?.env;

const allowedHosts = nodeEnv?.['ALLOWED_HOSTS']
  ? nodeEnv['ALLOWED_HOSTS'].split(',').map((host) => host.trim()).filter(Boolean)
  : [];

const engine = new AngularAppEngine({
  allowedHosts,
});

const isLongTermAsset = (pathname: string): boolean =>
  /\.(js|css|png|jpe?g|webp|svg|ttf|otf|woff2?|json)$/i.test(pathname);

const isHtmlRequest = (request: Request): boolean =>
  new URL(request.url).pathname === '/' ||
  request.headers.get('accept')?.includes('text/html') ||
  new URL(request.url).pathname.endsWith('.html');

const handler = async (request: Request): Promise<Response> => {
  const response = await engine.handle(request);
  if (!response) {
    return new Response('Not Found', { status: 404 });
  }

  const pathname = new URL(request.url).pathname;
  const headers = new Headers(response.headers);

  if (isLongTermAsset(pathname)) {
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  } else if (isHtmlRequest(request)) {
    headers.set(
      'Cache-Control',
      'public, max-age=3600, stale-while-revalidate=86400',
    );
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};

export const fetch = createRequestHandler(handler);
