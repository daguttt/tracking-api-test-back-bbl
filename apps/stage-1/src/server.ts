import 'reflect-metadata/lite';

import { trimTrailingSlash } from 'hono/trailing-slash';
import { cors } from 'hono/cors';

import {
	checkpointsRouter,
	shipmentsRouter,
	trackingsRouter,
} from '@modules/shipments';
import { dbSeedingRouter } from '@modules/db-seeding';

import { honoFactory } from './factory';
import { setupDIContainer } from './dependency-injection';

export function createServerApp() {
	const app = honoFactory.createApp().basePath('/api');
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

	setupDIContainer(app);

	app.route('/v1', createV1Router());

	return app;
}

function createV1Router() {
	const v1Router = honoFactory.createApp();
	v1Router.get('/health-check', (c) => c.json({ message: 'OK' }));

	v1Router.route('/seed', dbSeedingRouter);

	v1Router.route('/shipments', shipmentsRouter);
	v1Router.route('/checkpoints', checkpointsRouter);
	v1Router.route('/tracking', trackingsRouter);

	return v1Router;
}
