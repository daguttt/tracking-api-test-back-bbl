import { zValidator } from '@hono/zod-validator';

import { honoFactory } from '@/factory';
import { createCheckpointDtoSchema } from './create-checkpoint.dto';
import {
	checkpointsServiceToken,
	type CheckpointsService,
} from './checkpoints.service';

export const router = honoFactory.createApp();

router.post('/', zValidator('json', createCheckpointDtoSchema), async (c) => {
	const createCheckpointDto = c.req.valid('json');
	const checkpointsService = c.var.resolve<CheckpointsService>(
		checkpointsServiceToken
	);
	const result = await checkpointsService.create(createCheckpointDto);
	if (result.isErr()) {
		const error = result.error;

		switch (error._tag) {
			case 'UnitNotFoundError': {
				return c.json(
					{
						message: `Unit with ID: '${error.searchedId}' not found`,
					},
					404
				);
			}

			case 'DBError':
			default: {
				return c.json({ message: 'Error creating checkpoint' }, 500);
			}
		}
	}

	return c.body(null, 201);
});
