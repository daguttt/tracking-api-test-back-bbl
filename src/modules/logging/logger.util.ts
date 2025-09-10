import type { Context } from 'hono';
import { checkAvailabilityToLog } from './check-availability-to-log';
import type { LogLevelLabel } from './log-level-label.model';

export const logger = {
	log,
	debug,
	info,
	warn,
	error,
};

function log(
	c: Context<{ Bindings: CloudflareBindings }>,
	logLevel: LogLevelLabel,
	...args: object[]
) {
	const canLog = checkAvailabilityToLog(c, {
		targetLevel: logLevel,
	});

	if (!canLog) return;

	_log(logLevel, ...args);
}

function debug(
	c: Context<{ Bindings: CloudflareBindings }>,
	...args: unknown[]
) {
	const canLog = checkAvailabilityToLog(c, {
		targetLevel: 'debug',
	});

	if (!canLog) return;

	_log('debug', ...args);
}

function info(
	c: Context<{ Bindings: CloudflareBindings }>,
	...args: unknown[]
) {
	const canLog = checkAvailabilityToLog(c, {
		targetLevel: 'info',
	});

	if (!canLog) return;

	_log('info', ...args);
}

function warn(
	c: Context<{ Bindings: CloudflareBindings }>,
	...args: unknown[]
) {
	const canLog = checkAvailabilityToLog(c, {
		targetLevel: 'warn',
	});

	if (!canLog) return;

	_log('warn', ...args);
}

function error(
	c: Context<{ Bindings: CloudflareBindings }>,
	...args: unknown[]
) {
	const canLog = checkAvailabilityToLog(c, {
		targetLevel: 'error',
	});

	if (!canLog) return;

	_log('error', ...args);
}

function _log(logLevel: LogLevelLabel, ...args: unknown[]) {
	if (process.env.ENVIRONMENT === 'development') {
		console[logLevel](...args);
		return;
	}

	const stringArgs = args
		.filter((arg) => typeof arg === 'string')
		.join(' | - | ');
	const objectArgs = args.filter((arg) => typeof arg !== 'string');

	if (objectArgs.length === 0) {
		console[logLevel](stringArgs);
		return;
	}

	console[logLevel](stringArgs, JSON.stringify(objectArgs));
}
