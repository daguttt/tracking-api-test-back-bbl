import { z } from 'zod';

export const checkpointSchema = z.object({
  id: z.uuid(),
  unitId: z.uuid(),
  status: z.enum([
    'CREATED',
    'PICKED_UP',
    'IN_TRANSIT',
    'AT_FACILITY',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'EXCEPTION',
  ]),
});

export type Checkpoint = z.infer<typeof checkpointSchema>;

export type RequiredDataForCheckpoint = Pick<Checkpoint, 'unitId' | 'status'>;
