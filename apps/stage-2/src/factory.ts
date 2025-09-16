import { createFactory } from 'hono/factory';
import type { InjectionToken } from 'tsyringe';

export interface ServerEnv {
  Variables: {
    resolve: <T>(token: InjectionToken<T>) => T;
  };
}
export const honoFactory = createFactory<ServerEnv>();
