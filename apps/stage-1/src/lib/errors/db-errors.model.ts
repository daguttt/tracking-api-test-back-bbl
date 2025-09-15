import type { BaseError } from './base-error.model';

export class DBError implements BaseError {
	readonly _tag = 'DBError';

	constructor(readonly underlyingError?: unknown) {}
}

export class EntityNotFoundError implements BaseError {
	readonly _tag = 'EntityNotFoundError';

	constructor(
		readonly entityName?: string,
		readonly searchedId?: string,
		readonly underlyingError?: unknown,
		readonly message?: string
	) {}

	static create({
		entityName,
		searchedId,
		underlyingError,
		message,
	}: {
		entityName?: string;
		searchedId?: string;
		underlyingError?: unknown;
		message?: string;
	}) {
		return new EntityNotFoundError(
			entityName,
			searchedId,
			underlyingError,
			message
		);
	}
}
