import type {LogLevel} from '@remotion/renderer';
import {Log} from './log';

const cleanupJobs: {label: string; job: () => void}[] = [];

type CtrlCHandler = () => number | Promise<number>;

let ctrlCHandler: CtrlCHandler | null = null;

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

export const registerCtrlCHandler = (handler: CtrlCHandler) => {
	ctrlCHandler = handler;

	return () => {
		if (ctrlCHandler === handler) {
			ctrlCHandler = null;
		}
	};
};

export const handleCtrlC = ({
	indent,
	logLevel,
	exit = process.exit,
}: {
	indent: boolean;
	logLevel: LogLevel;
	exit?: (exitCode: number) => void;
}) => {
	let handlingCtrlC = false;
	let forceExited = false;

	const listener = async () => {
		if (handlingCtrlC) {
			forceExited = true;
			exit(130);
			return;
		}

		handlingCtrlC = true;
		Log.info({indent: false, logLevel});
		let exitCode = 0;
		const handler = ctrlCHandler;
		ctrlCHandler = null;

		try {
			if (handler) {
				exitCode = await handler();
			}
		} catch (err) {
			Log.error(
				{indent: false, logLevel},
				err instanceof Error ? err.message : String(err),
			);
			exitCode = 1;
		}

		if (forceExited) {
			return;
		}

		cleanupBeforeQuit({indent, logLevel});
		exit(exitCode);
	};

	process.on('SIGINT', listener);

	return () => process.removeListener('SIGINT', listener);
};
