import { AngularAppEngine, createRequestHandler } from '@angular/ssr';

const allowedHosts = process.env['ALLOWED_HOSTS']
  ? process.env['ALLOWED_HOSTS'].split(',').map((host) => host.trim()).filter(Boolean)
  : [];

const engine = new AngularAppEngine({
  allowedHosts
});

const handler = async (request: Request): Promise<Response> => {
  const response = await engine.handle(request);
  return response ?? new Response('Not Found', { status: 404 });
};

export default createRequestHandler(handler);
