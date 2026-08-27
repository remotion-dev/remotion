import {afterEach, expect, mock, spyOn, test} from 'bun:test';
import * as childProcess from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';

const gibibyte = 1024 * 1024 * 1024;
const memoryPaths = new Set([
	'/proc/meminfo',
	'/sys/fs/cgroup/memory.max',
	'/sys/fs/cgroup/memory.current',
	'/sys/fs/cgroup/memory/memory.limit_in_bytes',
	'/sys/fs/cgroup/memory/memory.usage_in_bytes',
]);
const originalPlatform = process.platform;
const originalLambdaMemory = process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE;

let nodeFreeMemory = 2 * gibibyte;
let memoryPressureOutput: string | null = null;
let files = new Map<string, string>();

mock.module('node:os', () => ({
	...os,
	freemem: () => nodeFreeMemory,
}));

mock.module('node:fs', () => ({
	...fs,
	existsSync: (path: fs.PathLike) => {
		const filePath = path.toString();
		if (memoryPaths.has(filePath)) {
			return files.has(filePath);
		}

		return fs.existsSync(path);
	},
	readFileSync: (path: fs.PathOrFileDescriptor, ...args: unknown[]) => {
		const filePath = path.toString();
		if (memoryPaths.has(filePath)) {
			const contents = files.get(filePath);
			if (contents === undefined) {
				throw new Error(`ENOENT: ${filePath}`);
			}

			return contents;
		}

		return Reflect.apply(fs.readFileSync, fs, [path, ...args]);
	},
}));

mock.module('node:child_process', () => ({
	...childProcess,
	execFileSync: (file: string, ...args: unknown[]) => {
		if (file === '/usr/bin/memory_pressure') {
			if (memoryPressureOutput === null) {
				throw new Error('memory_pressure unavailable');
			}

			return memoryPressureOutput;
		}

		return Reflect.apply(childProcess.execFileSync, childProcess, [
			file,
			...args,
		]);
	},
}));

const {getAvailableMemory} = require('../memory/get-available-memory');

const setPlatform = (platform: string) => {
	Object.defineProperty(process, 'platform', {value: platform});
};

const setProcAvailableMemory = (availableMemory: number) => {
	files.set(
		'/proc/meminfo',
		`MemTotal: 16777216 kB\nMemFree: 1048576 kB\nMemAvailable: ${availableMemory / 1024} kB\n`,
	);
};

afterEach(() => {
	Object.defineProperty(process, 'platform', {value: originalPlatform});
	nodeFreeMemory = 2 * gibibyte;
	memoryPressureOutput = null;
	files = new Map();

	if (originalLambdaMemory === undefined) {
		delete process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE;
	} else {
		process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE = originalLambdaMemory;
	}
});

test('uses Linux MemAvailable instead of immediately free pages', () => {
	setPlatform('linux');
	setProcAvailableMemory(8 * gibibyte);

	expect(getAvailableMemory('error')).toBe(8 * gibibyte);
});

test('bounds Linux MemAvailable by the remaining finite CGroup allocation', () => {
	setPlatform('linux');
	setProcAvailableMemory(8 * gibibyte);
	files.set('/sys/fs/cgroup/memory.max', String(6 * gibibyte));
	files.set('/sys/fs/cgroup/memory.current', String(gibibyte));

	expect(getAvailableMemory('error')).toBe(5 * gibibyte);
});

test('ignores an unlimited CGroup when selecting Linux MemAvailable', () => {
	setPlatform('linux');
	setProcAvailableMemory(8 * gibibyte);
	files.set('/sys/fs/cgroup/memory.max', 'max');
	files.set('/sys/fs/cgroup/memory.current', String(gibibyte));

	expect(getAvailableMemory('error')).toBe(8 * gibibyte);
});

test('uses the pressure-aware macOS available-memory estimate', () => {
	setPlatform('darwin');
	const totalMemory = 24 * gibibyte;
	memoryPressureOutput = `The system has ${totalMemory} (1572864 pages with a page size of 16384).\n\nSystem-wide memory free percentage: 79%\n`;

	expect(getAvailableMemory('error')).toBe(totalMemory * 0.79);
});

test('falls back to os.freemem() when memory_pressure cannot be parsed', () => {
	setPlatform('darwin');
	memoryPressureOutput = 'Unexpected output';

	expect(getAvailableMemory('error')).toBe(2 * gibibyte);
});

test('keeps the Lambda memory limit as a hard upper bound', () => {
	setPlatform('linux');
	setProcAvailableMemory(8 * gibibyte);
	process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE = '4096';

	expect(getAvailableMemory('error')).toBe(4 * gibibyte);
});

test('verbose logging identifies the selected memory source', () => {
	setPlatform('darwin');
	const totalMemory = 24 * gibibyte;
	memoryPressureOutput = `The system has ${totalMemory} (1572864 pages with a page size of 16384).\n\nSystem-wide memory free percentage: 79%\n`;
	const consoleSpy = spyOn(console, 'log').mockImplementation(() => undefined);

	getAvailableMemory('verbose');

	expect(consoleSpy.mock.calls.flat().join(' ')).toContain(
		'Available memory for rendering: 19415.04 MB (macOS memory_pressure;',
	);
	consoleSpy.mockRestore();
});
