import type { LogLevelLabel } from './log-level-label.model';

const LOG_LEVEL: Record<LogLevelLabel, number> = {
	debug: 10,
	info: 20,
	warn: 30,
	error: 40,
} as const;

export function checkAvailabilityToLog({
	targetLevel: targetLevelLabel,
}: {
	targetLevel: LogLevelLabel;
}) {
	const configuredLevel = LOG_LEVEL[process.env.LOGGING_LEVEL as LogLevelLabel];
	const targetLevel = LOG_LEVEL[targetLevelLabel];
	if (targetLevel < configuredLevel) return false;

	return true;
}
