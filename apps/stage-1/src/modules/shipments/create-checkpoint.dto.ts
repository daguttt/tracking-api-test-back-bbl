import { checkpointStatusValues } from '@db/schema';
import z from 'zod';

export const createCheckpointDtoSchema = z.object({
	unitId: z.string(),
	status: z.enum(checkpointStatusValues),
});

export type CreateCheckpointDto = z.infer<typeof createCheckpointDtoSchema>;
