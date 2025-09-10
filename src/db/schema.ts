import { relations, sql } from 'drizzle-orm';
import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

const timestamps = {
	updated_at: text().default(sql`(current_timestamp)`),
	created_at: text().default(sql`(current_timestamp)`),
};

export const shipmentsTable = sqliteTable('shipments', {
	id: text()
		.$defaultFn(() => crypto.randomUUID())
		.primaryKey(),
	status: text({
		enum: [
			'CREATED',
			'IN_PROGRESS',
			'PICKED_UP',
			'IN_TRANSIT',
			'AT_FACILITY',
			'OUT_FOR_DELIVERY',
			'DELIVERED',
			'PARTIALLY_DELIVERED',
			'EXCEPTION',
		],
	})
		.notNull()
		.default('CREATED'),
	...timestamps,
});

export const shipmentsRelations = relations(shipmentsTable, ({ many }) => ({
	units: many(unitsTable),
}));

export const unitsTable = sqliteTable('units', {
	id: text()
		.$defaultFn(() => crypto.randomUUID())
		.primaryKey(),
	shipmentId: text()
		.notNull()
		.references(() => shipmentsTable.id),
	...timestamps,
});

export const unitRelations = relations(unitsTable, ({ one }) => ({
	shipment: one(shipmentsTable, {
		fields: [unitsTable.shipmentId],
		references: [shipmentsTable.id],
	}),
}));

export const checkpointsTable = sqliteTable('checkpoints', {
	id: text()
		.$defaultFn(() => crypto.randomUUID())
		.primaryKey(),
	status: text({
		enum: [
			'CREATED',
			'PICKED_UP',
			'IN_TRANSIT',
			'AT_FACILITY',
			'OUT_FOR_DELIVERY',
			'DELIVERED',
			'EXCEPTION',
		],
	}).notNull(),
	unitId: text()
		.notNull()
		.references(() => unitsTable.id),
	...timestamps,
});

export const checkpointsRelations = relations(checkpointsTable, ({ one }) => ({
	unit: one(unitsTable, {
		fields: [checkpointsTable.unitId],
		references: [unitsTable.id],
	}),
}));
