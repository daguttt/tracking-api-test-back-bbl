import { drizzle } from 'drizzle-orm/d1';

import { honoFactory } from '@/server';

import { seedShipments } from './shipments.seeder';
import { seedUnits } from './units.seeder';
import { seedCheckpoints } from './checkpoints.seeder';

export const router = honoFactory.createApp();

router.get('/', async (c) => {
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
