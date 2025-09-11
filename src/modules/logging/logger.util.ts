import type { LogLevelLabel } from './log-level-label.model';

export const logger = {
	log,
	debug,
	info,
	warn,
	error,
};

function log(logLevel: LogLevelLabel, ...args: object[]) {
	_log(logLevel, ...args);
}

function debug(...args: unknown[]) {
	_log('debug', ...args);
}

function info(...args: unknown[]) {
	_log('info', ...args);
}

function warn(...args: unknown[]) {
	_log('warn', ...args);
}

function error(...args: unknown[]) {
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
