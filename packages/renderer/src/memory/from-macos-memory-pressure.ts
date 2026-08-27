import {execFileSync} from 'node:child_process';
import type {LogLevel} from '../log-level';
import {Log} from '../logger';

export const parseMacOSMemoryPressureOutput = (output: string) => {
	const totalMemoryMatch = output.match(/The system has (\d+) /);
	const freePercentageMatch = output.match(
		/System-wide memory free percentage:\s*([\d.]+)%/,
	);

	if (totalMemoryMatch === null || freePercentageMatch === null) {
		return null;
	}

	const totalMemory = Number(totalMemoryMatch[1]);
	const freePercentage = Number(freePercentageMatch[1]);

	if (
		!Number.isFinite(totalMemory) ||
		totalMemory <= 0 ||
		!Number.isFinite(freePercentage) ||
		freePercentage < 0 ||
		freePercentage > 100
	) {
		return null;
	}

	return totalMemory * (freePercentage / 100);
};

export const getAvailableMemoryFromMacOS = (
	logLevel: LogLevel,
): number | null => {
	if (process.platform !== 'darwin') {
		return null;
	}

	try {
		const output = execFileSync('/usr/bin/memory_pressure', [], {
			encoding: 'utf8',
		});
		const availableMemory = parseMacOSMemoryPressureOutput(output);

		if (availableMemory === null) {
			throw new Error('Failed to parse memory_pressure output');
		}

		return availableMemory;
	} catch (err) {
		Log.verbose(
			{indent: false, logLevel},
			'Failed to get available memory from macOS memory_pressure, falling back to os.freemem():',
		);
		Log.verbose({indent: false, logLevel}, err);
		return null;
	}
};
