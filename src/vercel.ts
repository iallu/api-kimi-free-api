import type { VercelRequest, VercelResponse } from '@vercel/node';
import server from '@/lib/server';
import routes from '@/api/routes/index';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await server.attachRoutes(routes);
  return server.app.callback()(req, res);
} 