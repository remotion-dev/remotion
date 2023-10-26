import type {LogLevel} from '@remotion/renderer';
import {Log} from './log';

const cleanupJobs: (() => void)[] = [];

export const cleanupBeforeQuit = ({
	indent,
	logLevel,
}: {
	indent: boolean;
	logLevel: LogLevel;
}) => {
	Log.verbose({indent, logLevel}, 'Cleaning up...');
	const time = Date.now();
	for (const job of cleanupJobs) {
		job();
	}

	Log.verbose({indent, logLevel}, `Cleanup done in ${Date.now() - time}ms`);
};

export const registerCleanupJob = (job: () => void) => {
	cleanupJobs.push(job);
};

export const handleCtrlC = ({
	indent,
	logLevel,
}: {
	indent: boolean;
	logLevel: LogLevel;
}) => {
	process.on('SIGINT', () => {
		Log.infoAdvanced({indent: false, logLevel});
		cleanupBeforeQuit({indent, logLevel});
		process.exit(0);
	});
};
