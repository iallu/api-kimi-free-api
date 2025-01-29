import type { VercelRequest, VercelResponse } from '@vercel/node';
import server from '@/lib/server';
import routes from '@/api/routes/index';

let isInitialized = false;

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (!isInitialized) {
        await server.attachRoutes(routes);
        isInitialized = true;
    }
    return server.app.callback()(req, res);
} 