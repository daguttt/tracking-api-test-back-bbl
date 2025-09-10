import type { Context } from 'hono';
import type { LogLevelLabel } from './log-level-label.model';

const LOG_LEVEL: Record<LogLevelLabel, number> = {
	debug: 10,
	info: 20,
	warn: 30,
	error: 40,
} as const;

export function checkAvailabilityToLog(
	c: Context<{ Bindings: CloudflareBindings }>,
	{
		targetLevel: targetLevelLabel,
	}: {
		targetLevel: LogLevelLabel;
	}
) {
	const configuredLevel = LOG_LEVEL[c.env.LOGGING_LEVEL as LogLevelLabel];
	const targetLevel = LOG_LEVEL[targetLevelLabel];
	if (targetLevel < configuredLevel) return false;

	return true;
}
