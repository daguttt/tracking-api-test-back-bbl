import { createFactory } from 'hono/factory';
import type { InjectionToken } from 'tsyringe';

export type HonoEnv = {
	Bindings: CloudflareBindings;
	Variables: {
		resolve: <T>(token: InjectionToken<T>) => T;
	};
};
export const honoFactory = createFactory<HonoEnv>();
