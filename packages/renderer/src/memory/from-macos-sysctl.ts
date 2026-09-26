import {execFileSync} from 'node:child_process';
import type {LogLevel} from '../log-level';
import {isEqualOrBelowLogLevel} from '../log-level';
import {Log} from '../logger';

// kern.memorystatus_vm_pressure_level: 1 = normal, 2 = warning, 4 = critical
const CRITICAL_MEMORY_PRESSURE = 4;

let loggedSource = false;

// os.freemem() only counts free and speculative pages on macOS. File-backed
// pages (the file cache) and purgeable pages can also be reclaimed without
// swapping, like MemAvailable on Linux. The memory_pressure percentage is not
// used, because it also counts memory that apps are using.
export const parseMacOSMemorySysctl = (output: string): number | null => {
	const values = output
		.trim()
		.split('\n')
		.map((line) => Number(line));

	if (
		values.length !== 5 ||
		values.some((value) => !Number.isInteger(value) || value < 0)
	) {
		return null;
	}

	const [freePages, fileBackedPages, purgeablePages, pageSize, pressureLevel] =
		values;

	// At critical pressure, count free pages only, as before
	if (pageSize === 0 || pressureLevel >= CRITICAL_MEMORY_PRESSURE) {
		return null;
	}

	return (freePages + fileBackedPages + purgeablePages) * pageSize;
};

export const getAvailableMemoryFromMacOSSysctl = (
	logLevel: LogLevel,
): number | null => {
	if (process.platform !== 'darwin') {
		return null;
	}

	try {
		const output = execFileSync(
			'/usr/sbin/sysctl',
			[
				'-n',
				'vm.page_free_count',
				'vm.page_pageable_external_count',
				'vm.page_purgeable_count',
				// The page counts are in kernel pages. hw.pagesize is the page size
				// of the calling process, which is 4 KB under Rosetta.
				'vm.pagesize',
				'kern.memorystatus_vm_pressure_level',
			],
			{stdio: 'pipe', encoding: 'utf-8'},
		);
		const availableMemory = parseMacOSMemorySysctl(output);

		if (availableMemory === null) {
			Log.verbose(
				{indent: false, logLevel},
				'Memory pressure is critical or the sysctl output is unexpected, using os.freemem():',
				output.trim().split('\n').join(' '),
			);
			return null;
		}

		if (!loggedSource && isEqualOrBelowLogLevel(logLevel, 'verbose')) {
			loggedSource = true;
			Log.verbose(
				{indent: false, logLevel},
				`Available memory: ${(availableMemory / 1024 / 1024).toFixed(0)} MB (free, file-backed and purgeable pages, from sysctl)`,
			);
		}

		return availableMemory;
	} catch (err) {
		Log.verbose(
			{indent: false, logLevel},
			'Could not read memory statistics with sysctl, using os.freemem():',
		);
		Log.verbose({indent: false, logLevel}, err);
		return null;
	}
};
