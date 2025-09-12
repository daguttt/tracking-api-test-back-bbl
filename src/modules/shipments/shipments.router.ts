import { shipments } from '@db/schema';
import { drizzle } from 'drizzle-orm/d1';

import { honoFactory } from '@/server';

export const router = honoFactory.createApp();

router.get('/shipments', async (c) => {
	const db = drizzle(c.env.DB);

	const fetchedShipments = await db.select().from(shipments);

	return c.json(fetchedShipments);
});

router.get('/tracking/:trackingId', (c) => c.json({ message: 'OK' }));

router.post('/checkpoints', (c) => c.json({ message: 'OK' }));
