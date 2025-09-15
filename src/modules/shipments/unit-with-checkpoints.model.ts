import type { Checkpoint, Unit } from '@db/schema';

export interface UnitWithCheckpoints extends Unit {
	checkpoints: Checkpoint[];
}

export interface UnitWithCurrentStatusAndCheckpoints
	extends UnitWithCheckpoints {
	currentStatus: string;
}
