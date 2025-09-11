import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';

import type { HonoEnv } from '@modules/hono';

import { seedShipments } from './shipments.seeder';
import { seedUnits } from './units.seeder';
import { seedCheckpoints } from './checkpoints.seeder';

export const router = new Hono<HonoEnv>();

router.get('/seed', async (c) => {
	const db = drizzle(c.env.DB, { casing: 'snake_case' });

	const { insertedShipmentIds } = await seedShipments(db);
	const { insertedUnitIds } = await seedUnits(db, {
		shipmentIds: insertedShipmentIds.map((shipment) => shipment.id),
	});
	await seedCheckpoints(db, {
		unitIds: insertedUnitIds.map((unit) => unit.id),
	});

	return c.json({ message: 'OK', insertedShipmentIds });
});
