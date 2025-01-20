import type {LogLevel} from '@remotion/renderer';
import {Log} from './log';

const cleanupJobs: {label: string; job: () => void}[] = [];

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
		job.job();
		Log.verbose({indent, logLevel}, `Cleanup job "${job.label}" done`);
	}

	Log.verbose({indent, logLevel}, `Cleanup done in ${Date.now() - time}ms`);
};

export const registerCleanupJob = (label: string, job: () => void) => {
	cleanupJobs.push({job, label});
};

export const handleCtrlC = ({
	indent,
	logLevel,
}: {
	indent: boolean;
	logLevel: LogLevel;
}) => {
	process.on('SIGINT', () => {
		Log.info({indent: false, logLevel});
		cleanupBeforeQuit({indent, logLevel});
		process.exit(0);
	});
};
