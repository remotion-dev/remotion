import {expect, spyOn, test} from 'bun:test';
import childProcess from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import {openDirectoryInFinder} from '../open-directory-in-finder';

const mockPlatform = (platform: NodeJS.Platform) =>
	spyOn(os, 'platform').mockReturnValue(platform);

const mockSpawn = () => {
	const calls: {command: string; args: readonly string[]}[] = [];
	const spy = spyOn(childProcess, 'spawn').mockImplementation(((
		command: string,
		args: readonly string[],
	) => {
		calls.push({command, args});
		return {
			on: (event: string, callback: (code: number) => void) => {
				if (event === 'exit') {
					queueMicrotask(() => callback(0));
				}
			},
			stderr: {on: () => undefined},
			kill: () => undefined,
		};
	}) as unknown as typeof childProcess.spawn);

	return {calls, spy};
};

test('Should not allow to open a directory outside of the project', () => {
	expect(() => openDirectoryInFinder('../outside', process.cwd())).toThrow(
		/Not allowed to open/,
	);
});

test('Should open the resolved directory, not the raw argument', async () => {
	const platformSpy = mockPlatform('darwin');
	const {calls, spy} = mockSpawn();

	try {
		await openDirectoryInFinder('sub', process.cwd());

		expect(calls).toEqual([
			{command: 'open', args: ['-R', path.join(process.cwd(), 'sub')]},
		]);
	} finally {
		spy.mockRestore();
		platformSpy.mockRestore();
	}
});

test('Should not allow to open an absolute directory outside of the project', () => {
	// An absolute path on a different root makes path.relative() return that
	// absolute path unchanged, so a `startsWith("..")` check alone misses it.
	const cwdRoot = path.parse(process.cwd()).root;
	const outside =
		process.platform === 'win32'
			? cwdRoot.toLowerCase().startsWith('c:')
				? 'D:\\outside'
				: 'C:\\outside'
			: '/outside';

	expect(() => openDirectoryInFinder(outside, process.cwd())).toThrow(
		/Not allowed to open/,
	);
});
