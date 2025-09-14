import { honoFactory } from '@/factory';

import { DbSeedingService } from './db-seeding.service';

export const router = honoFactory.createApp();

router.get('/', async (c) => {
	const dbSeedingService = c.var.resolve(DbSeedingService);
	const result = await dbSeedingService.seed();

	if (result.isErr()) {
		return c.json({ message: 'Error seeding database' }, 500);
	}

	return c.json({ message: 'OK' });
});
