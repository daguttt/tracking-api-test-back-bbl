import { z } from 'zod';

export const unitSchema = z.object({
  id: z.uuid(),
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

export type Unit = z.infer<typeof unitSchema>;
