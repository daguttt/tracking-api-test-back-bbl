import type { Hono } from 'hono';
import { createMiddleware } from 'hono/factory';
import { container, type DependencyContainer } from 'tsyringe';

import { createCheckpointUseCaseToken } from '@modules/tracking/application';
import { CreateCheckpointUseCaseLive } from '@modules/tracking/application';
import { checkpointsRepositoryToken } from '@modules/tracking/domain';

import type { ServerEnv } from './factory';

function tsyringeMiddleware(
  ...providers: ((container: DependencyContainer) => void)[]
) {
  return createMiddleware<ServerEnv>(async (c, next) => {
    const childContainer = container.createChildContainer();
    providers.forEach((provider) => provider(childContainer));
    c.set('resolve', (token) => childContainer.resolve(token));
    await next();
  });
}

export function setupDIContainer(app: Hono<ServerEnv>) {
  app.use('*', async (c, next) => {
    await tsyringeMiddleware((container) => {
      // TODO: Register dependencies here

      container.register(checkpointsRepositoryToken, {
        useClass: PgCheckpointsRepository,
      });

      container.register(createCheckpointUseCaseToken, {
        useClass: CreateCheckpointUseCaseLive,
      });
    })(c, next);
  });
}
