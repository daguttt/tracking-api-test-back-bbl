import { shipmentsTable } from '@db/schema';
import { drizzle } from 'drizzle-orm/d1';
import { Hono } from 'hono';

export const router = new Hono<{ Bindings: CloudflareBindings }>();

router.get('/shipments', async (c) => {
	const db = drizzle(c.env.DB);

	const fetchedShipments = await db.select().from(shipmentsTable);

	return c.json(fetchedShipments);
});

router.get('/tracking/:trackingId', (c) => c.json({ message: 'OK' }));

router.post('/checkpoints', (c) => c.json({ message: 'OK' }));
