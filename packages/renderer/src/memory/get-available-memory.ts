import {freemem} from 'node:os';
import type {LogLevel} from '../log-level';
import {Log} from '../logger';
import {getAvailableMemoryFromCgroup} from './from-docker-cgroup';
import {getMaxLambdaMemory} from './from-lambda-env';
import {getFreeMemoryFromProcMeminfo} from './from-proc-meminfo';

export const getAvailableMemory = (logLevel: LogLevel) => {
	// If we are in Lambda, the most reliable way is to read the environment variable
	// This is also pretty much free
	const maxMemory = getMaxLambdaMemory();

	if (maxMemory !== null) {
		const nodeMemory = freemem();
		return Math.min(nodeMemory, maxMemory);
	}

	// If cgroup memory data is available, we are in Docker, and we should respect it
	const cgroupMemory = getAvailableMemoryFromCgroup();
	if (cgroupMemory !== null) {
		// There are 2 Docker memory configurations:
		// 1. --memory=[num]
		// 2. Global Docker memory limit

		// If cgroup limit is higher than global memory, the global memory limit still applies
		const nodeMemory = freemem();
		const _procInfo = getFreeMemoryFromProcMeminfo(logLevel);

		if (cgroupMemory > nodeMemory * 1.25 && Number.isFinite(cgroupMemory)) {
			Log.warn({indent: false, logLevel}, 'Detected differing memory amounts:');
			Log.warn(
				{indent: false, logLevel},
				`Memory reported by CGroup: ${(cgroupMemory / 1024 / 1024).toFixed(2)} MB`,
			);
			if (_procInfo !== null) {
				Log.warn(
					{indent: false, logLevel},
					`Memory reported by /proc/meminfo: ${(_procInfo / 1024 / 1024).toFixed(2)} MB`,
				);
			}

			Log.warn(
				{indent: false, logLevel},
				`Memory reported by Node: ${(nodeMemory / 1024 / 1024).toFixed(2)} MB`,
			);
			Log.warn(
				{indent: false, logLevel},
				'You might have inadvertenly set the --memory flag of `docker run` to a value that is higher than the global Docker memory limit.',
			);
			Log.warn(
				{indent: false, logLevel},
				'Using the lower amount of memory for calculation.',
			);
		}

		return Math.min(nodeMemory, cgroupMemory);
	}

	const procInfo = getFreeMemoryFromProcMeminfo(logLevel);

	if (procInfo !== null) {
		return Math.min(freemem(), procInfo);
	}

	return freemem();
};
