import type { VercelRequest, VercelResponse } from '@vercel/node';
import Koa from 'koa';
import koaBody from 'koa-body';
import koaCors from 'koa2-cors';
import koaRange from 'koa-range';
import routes from '@/api/routes/index';
import config from '@/lib/config';

const app = new Koa();

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
for (const route of routes) {
    const prefix = route.prefix || '';
    for (const method in route) {
        if (method === 'prefix') continue;
        for (const path in route[method]) {
            const handler = route[method][path];
            app.use(async (ctx, next) => {
                if (ctx.method.toLowerCase() === method.toLowerCase() && 
                    ctx.path === prefix + path) {
                    ctx.body = await handler(ctx);
                } else {
                    await next();
                }
            });
        }
    }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    return new Promise((resolve, reject) => {
        app.callback()(req, res);
    });
} 