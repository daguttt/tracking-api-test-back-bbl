import { Hono } from 'hono';
import { trimTrailingSlash } from 'hono/trailing-slash';
import { cors } from 'hono/cors';

import { shipmentsRouter } from '@modules/shipments';

export function createServerApp() {
	const app = new Hono<{ Bindings: CloudflareBindings }>().basePath('/api');
	app.use(trimTrailingSlash());
	app.use(
		cors({
			origin: '*',
			allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
			allowHeaders: [
				'Content-Type',
				'Authorization',
				'X-Requested-With',
				'Accept',
				'Origin',
			],
			exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
			maxAge: 600,
			credentials: true,
		})
	);

	app.route('/v1', createV1Router());

	return app;
}

function createV1Router() {
	const v1Router = new Hono<{ Bindings: CloudflareBindings }>();
	v1Router.get('/health-check', (c) => c.json({ message: 'OK' }));

	v1Router.route('/', shipmentsRouter);

	return v1Router;
}
