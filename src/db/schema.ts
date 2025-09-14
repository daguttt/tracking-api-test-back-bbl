import { relations, sql } from 'drizzle-orm';
import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

const timestamps = {
	updatedAt: text('updated_at').default(sql`(current_timestamp)`),
	createdAt: text('created_at').default(sql`(current_timestamp)`),
};

export const shipments = sqliteTable('shipments', {
	id: text()
		.$defaultFn(() => crypto.randomUUID())
		.primaryKey(),
	...timestamps,
});

export type Shipment = typeof shipments.$inferSelect;

export const shipmentsRelations = relations(shipments, ({ many }) => ({
	units: many(units),
}));

export const units = sqliteTable('units', {
	id: text()
		.$defaultFn(() => crypto.randomUUID())
		.primaryKey(),
	shipmentId: text('shipment_id')
		.notNull()
		.references(() => shipments.id),
	...timestamps,
});

export type Unit = typeof units.$inferSelect;

export const unitRelations = relations(units, ({ one }) => ({
	shipment: one(shipments, {
		fields: [units.shipmentId],
		references: [shipments.id],
	}),
}));

export const checkpointStatusValues = [
	'CREATED',
	'PICKED_UP',
	'IN_TRANSIT',
	'AT_FACILITY',
	'OUT_FOR_DELIVERY',
	'DELIVERED',
	'EXCEPTION',
] as const;
export const checkpoints = sqliteTable('checkpoints', {
	id: text()
		.$defaultFn(() => crypto.randomUUID())
		.primaryKey(),
	status: text({
		enum: checkpointStatusValues,
	}).notNull(),
	unitId: text('unit_id')
		.notNull()
		.references(() => units.id),
	...timestamps,
});

export type Checkpoint = typeof checkpoints.$inferSelect;

export const checkpointsRelations = relations(checkpoints, ({ one }) => ({
	unit: one(units, {
		fields: [checkpoints.unitId],
		references: [units.id],
	}),
}));
