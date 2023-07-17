import {Log} from './log';

const cleanupJobs: (() => void)[] = [];

export const cleanupBeforeQuit = () => {
	Log.verbose('Cleaning up...');
	const time = Date.now();
	for (const job of cleanupJobs) {
		job();
	}

	Log.verbose(`Cleanup done in ${Date.now() - time}ms`);
};

export const registerCleanupJob = (job: () => void) => {
	cleanupJobs.push(job);
};

export const handleCtrlC = () => {
	process.on('SIGINT', () => {
		Log.info();
		cleanupBeforeQuit();
		process.exit(0);
	});
};
