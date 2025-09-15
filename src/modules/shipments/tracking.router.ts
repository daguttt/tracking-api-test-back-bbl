import { honoFactory } from '@/factory';
import { trackingServiceToken, type TrackingService } from './tracking.service';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

export const router = honoFactory.createApp();

router.get(
	'/:id',
	zValidator('param', z.object({ id: z.uuid() })),
	async (c) => {
		const id = c.req.param('id');

		const trackingService =
			c.var.resolve<TrackingService>(trackingServiceToken);
		const result = await trackingService.getHistoryByTrackingId(id);

		if (result.isErr()) {
			const error = result.error;

			switch (error._tag) {
				case 'ShipmentNotFoundError': {
					return c.json(
						{
							message: `Shipment with ID: '${error.searchedId}' not found`,
						},
						404
					);
				}

				case 'DBError':
				default: {
					return c.json({ message: 'Error getting tracking history' }, 500);
				}
			}
		}

		return c.json(result.value);
	}
);
