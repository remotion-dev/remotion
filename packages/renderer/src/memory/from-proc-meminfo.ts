import {existsSync, readFileSync} from 'node:fs';
import type {LogLevel} from '../log-level';
import {Log} from '../logger';

export const getFreeMemoryFromProcMeminfo = (
	logLevel: LogLevel,
): number | null => {
	if (!existsSync('/proc/meminfo')) {
		return null;
	}

	try {
		const data = readFileSync('/proc/meminfo', 'utf-8');
		// Split the file by lines and find the line with MemFree
		const lines = data.split('\n');
		const memAvailableLine = lines.find((line) =>
			line.startsWith('MemAvailable'),
		);

		// If we couldn't find MemAvailable, return an error
		if (!memAvailableLine) {
			throw new Error('MemAvailable not found in /proc/meminfo');
		}

		// Extract the value and unit from the line
		const matches = memAvailableLine.match(/(\d+)\s+(\w+)/);
		if (!matches || matches.length !== 3) {
			throw new Error('Failed to parse MemAvailable value');
		}

		const value = parseInt(matches[1], 10);
		const unit = matches[2].toLowerCase();

		// Convert the value to bytes based on its unit
		switch (unit) {
			case 'kb':
				return value * 1024;
			case 'mb':
				return value * 1024 * 1024;
			case 'gb':
				return value * 1024 * 1024 * 1024;
			default:
				throw new Error(`Unknown unit: ${unit}`);
		}
	} catch (err) {
		Log.warn(
			{indent: false, logLevel},
			'/proc/meminfo exists but failed to get memory info. Error:',
		);
		Log.warn({indent: false, logLevel}, err);

		return null;
	}
};
