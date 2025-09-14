import type { Checkpoint } from '@db/schema';
import type { BaseError } from '@lib/errors';

export class CheckpointWithStatusAlreadyExistsError implements BaseError {
	readonly _tag = 'CheckpointWithStatusAlreadyExistsError';

	constructor(readonly foundStatus?: Checkpoint['status']) {}

	static create({ foundStatus }: { foundStatus?: Checkpoint['status'] }) {
		return new CheckpointWithStatusAlreadyExistsError(foundStatus);
	}
}
