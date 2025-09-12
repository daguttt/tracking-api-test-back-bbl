import type { LogLevelLabel } from './log-level-label.model';
import { checkAvailabilityToLog } from './check-availability-to-log';

export const logger = {
	log,
	debug,
	info,
	warn,
	error,
};

function log(logLevel: LogLevelLabel, ...args: object[]) {
	const canLog = checkAvailabilityToLog({
		targetLevel: logLevel,
	});

	if (!canLog) return;

	_log(logLevel, ...args);
}

function debug(...args: unknown[]) {
	const canLog = checkAvailabilityToLog({
		targetLevel: 'debug',
	});

	if (!canLog) return;

	_log('debug', ...args);
}

function info(...args: unknown[]) {
	const canLog = checkAvailabilityToLog({
		targetLevel: 'info',
	});

	if (!canLog) return;

	_log('info', ...args);
}

function warn(...args: unknown[]) {
	const canLog = checkAvailabilityToLog({
		targetLevel: 'warn',
	});

	if (!canLog) return;

	_log('warn', ...args);
}

function error(...args: unknown[]) {
	const canLog = checkAvailabilityToLog({
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
