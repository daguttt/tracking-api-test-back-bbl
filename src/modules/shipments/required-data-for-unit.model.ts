import type { Prettify } from '@lib/helper-types';
import type { Unit } from '@db/schema';

export type RequiredDataForUnit = Prettify<
	Partial<Unit> & Pick<Unit, 'shipmentId'>
>;
