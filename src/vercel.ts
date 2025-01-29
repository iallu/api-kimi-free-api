import type { VercelRequest, VercelResponse } from '@vercel/node';
import Koa from 'koa';
import KoaRouter from 'koa-router';
import koaBody from 'koa-body';
import koaCors from 'koa2-cors';
import koaRange from 'koa-range';
import routes from '@/api/routes/index';
import config from '@/lib/config';

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
    return new Promise((resolve) => {
        app.callback()(req, res);
    });
} 