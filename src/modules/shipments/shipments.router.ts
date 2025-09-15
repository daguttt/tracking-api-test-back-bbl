import { honoFactory } from '@/factory';
import {
	shipmentsServiceToken,
	type ShipmentsService,
} from './shipments.service';

export const router = honoFactory.createApp();

router.get('/', async (c) => {
	const shipmentsService = c.var.resolve<ShipmentsService>(
		shipmentsServiceToken
	);
	const result = await shipmentsService.findAll();

	if (result.isErr()) {
		const error = result.error;

		switch (error._tag) {
			case 'DBError':
			default: {
				return c.json({ message: 'Error getting shipments' }, 500);
			}
		}
	}

	return c.json(result.value);
});
