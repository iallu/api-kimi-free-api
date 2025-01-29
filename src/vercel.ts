import type { VercelRequest, VercelResponse } from '@vercel/node';
import Koa from 'koa';
import KoaRouter from 'koa-router';
import koaBody from 'koa-body';
import koaCors from 'koa2-cors';
import koaRange from 'koa-range';
import routes from '@/api/routes/index';
import config from '@/lib/config';

// 创建应用实例
const createApp = () => {
    const app = new Koa();
    const router = new KoaRouter();

    // 启用跨域
    app.use(koaCors());

    // 启用范围请求支持
    app.use(koaRange);

    // 启用请求体解析
    app.use(koaBody(config.system.requestBody));

    // 错误处理
    app.use(async (ctx, next) => {
        try {
            await next();
        } catch (err) {
            console.error(err);
            ctx.status = 500;
            ctx.body = {
                code: -1,
                message: err.message || 'Internal Server Error'
            };
        }
    });

    // 加载路由
    routes.forEach((route: any) => {
        const prefix = route.prefix || '';
        Object.keys(route).forEach(method => {
            if (method === 'prefix') return;
            
            const methodRoutes = route[method];
            Object.keys(methodRoutes).forEach(path => {
                const handler = methodRoutes[path];
                const fullPath = `${prefix}${path}`;
                
                switch (method.toLowerCase()) {
                    case 'get':
                        router.get(fullPath, async (ctx) => {
                            ctx.body = await handler(ctx);
                        });
                        break;
                    case 'post':
                        router.post(fullPath, async (ctx) => {
                            ctx.body = await handler(ctx);
                        });
                        break;
                    case 'put':
                        router.put(fullPath, async (ctx) => {
                            ctx.body = await handler(ctx);
                        });
                        break;
                    case 'delete':
                        router.delete(fullPath, async (ctx) => {
                            ctx.body = await handler(ctx);
                        });
                        break;
                }
            });
        });
    });

    // 使用路由中间件
    app.use(router.routes());
    app.use(router.allowedMethods());

    return app;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        const app = createApp();
        await new Promise<void>((resolve, reject) => {
            const handleError = (err: Error) => {
                reject(err);
            };
            
            res.on('error', handleError);
            const callback = app.callback();
            callback(req, res);
            
            // 确保响应结束
            if (!res.writableEnded) {
                res.on('finish', () => resolve());
            } else {
                resolve();
            }
        });
    } catch (error) {
        console.error('Handler error:', error);
        res.status(500).json({
            code: -1,
            message: 'Internal Server Error'
        });
    }
}

// 配置 Edge Runtime
export const config = {
    runtime: 'edge',
}; 