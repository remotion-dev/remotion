import {freemem, platform} from 'node:os';
import type {LogLevel} from '../log-level';
import {Log} from '../logger';
import {getAvailableMemoryFromCgroup} from './from-docker-cgroup';
import {getMaxLambdaMemory} from './from-lambda-env';
import {getAvailableMemoryFromMacos} from './from-macos-sysctl';
import {getAvailableMemoryFromProcMeminfo} from './from-proc-meminfo';

export const getAvailableMemory = (logLevel: LogLevel) => {
	let hostMemory = freemem();
	let source = 'os.freemem()';
	if (platform() === 'linux') {
		const procInfo = getAvailableMemoryFromProcMeminfo(logLevel);
		if (procInfo !== null) {
			hostMemory = procInfo;
			source = '/proc/meminfo MemAvailable';
		}
	} else if (platform() === 'darwin') {
		const macosMemory = getAvailableMemoryFromMacos(logLevel);
		if (macosMemory !== null) {
			hostMemory = macosMemory;
			source = 'macOS sysctl (free, file-backed and purgeable pages)';
		}
	}

	let availableMemory = hostMemory;
	const cgroupMemory =
		platform() === 'linux' ? getAvailableMemoryFromCgroup() : null;
	if (cgroupMemory !== null && Number.isFinite(cgroupMemory)) {
		// There are 2 Docker memory configurations:
		// 1. --memory=[num]
		// 2. Global Docker memory limit

		// If cgroup limit is higher than global memory, the global memory limit still applies
		if (cgroupMemory > hostMemory * 1.25) {
			Log.warn({indent: false, logLevel}, 'Detected differing memory amounts:');
			Log.warn(
				{indent: false, logLevel},
				`Memory reported by CGroup: ${(cgroupMemory / 1024 / 1024).toFixed(2)} MB`,
			);
			Log.warn(
				{indent: false, logLevel},
				`Memory reported by ${source}: ${(hostMemory / 1024 / 1024).toFixed(2)} MB`,
			);
			Log.warn(
				{indent: false, logLevel},
				'You might have inadvertently set the --memory flag of `docker run` to a value that is higher than the global Docker memory limit.',
			);
			Log.warn(
				{indent: false, logLevel},
				'Using the lower amount of memory for calculation.',
			);
		}

		availableMemory = Math.min(availableMemory, Math.max(0, cgroupMemory));
		source += ', bounded by remaining cgroup memory';
	}

	const maxLambdaMemory = getMaxLambdaMemory();
	if (maxLambdaMemory !== null && Number.isFinite(maxLambdaMemory)) {
		availableMemory = Math.min(availableMemory, Math.max(0, maxLambdaMemory));
		source += ', bounded by Lambda memory';
	}

	Log.verbose(
		{indent: false, logLevel},
		`Available memory: ${(availableMemory / 1024 / 1024).toFixed(2)} MiB (${source})`,
	);
	return availableMemory;
};
