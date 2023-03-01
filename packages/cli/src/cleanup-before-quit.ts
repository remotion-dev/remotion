import {Log} from './log';

const cleanupJobs: (() => void)[] = [];

export const cleanupBeforeQuit = () => {
	for (const job of cleanupJobs) {
		job();
	}
};

export const registerCleanupJob = (job: () => void) => {
	cleanupJobs.push(job);
};

export const handleCtrlC = () => {
	process.on('SIGINT', () => {
		Log.info();
		cleanupBeforeQuit();
		process.exit(1);
	});
};
