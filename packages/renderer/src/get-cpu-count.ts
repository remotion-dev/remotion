// Kubernetes uses the following command to spawn Docker containers:
// docker run --cpuset-cpus="0,1" to assign only 2 CPUs.
// However, Node.js returns the core count of the host system (up to 96!)

import {exec} from 'node:child_process';
import {cpus} from 'node:os';
import type {LogLevel} from './log-level';
import {Log} from './logger';

let cached: number | null = null;

// We also get it from nproc and use the minimum of the two.
export const getConcurrencyFromNProc = ({
	indent,
	logLevel,
}: {
	indent: boolean;
	logLevel: LogLevel;
}): Promise<number | null> => {
	if (cached !== null) {
		return Promise.resolve(cached);
	}

	return new Promise<number | null>((resolve) => {
		exec(
			'nproc',
			{
				signal:
					// Will be baseline available in Remotion 5.0
					typeof AbortSignal.timeout !== 'undefined'
						? AbortSignal.timeout(2000)
						: undefined,
			},
			(err, res) => {
				if (err) {
					Log.verbose(
						{indent, logLevel},
						`Error getting CPU count from "nproc": ${err}. Using "os.cpus()" instead.`,
					);
					resolve(null);
					return;
				}

				cached = parseInt(res, 10);
				resolve(cached);
			},
		);
	});
};

export const getCpuCount = async ({
	indent,
	logLevel,
}: {
	indent: boolean;
	logLevel: LogLevel;
}) => {
	const node = cpus().length;
	const nproc = await getConcurrencyFromNProc({indent, logLevel});
	if (nproc === null) {
		return node;
	}

	return Math.min(nproc, node);
};
