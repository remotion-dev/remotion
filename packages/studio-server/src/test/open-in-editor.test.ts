import {expect, spyOn, test} from 'bun:test';
import childProcess from 'node:child_process';
import type {SpawnOptions} from 'node:child_process';
import {EventEmitter} from 'node:events';
import {
	findMacOsEditorsFromProcessOutput,
	launchEditor,
} from '../helpers/open-in-editor';
import {findSearchPosition} from '../preview-server/routes/find-in-file';

test('detects current VS Code macOS processes', () => {
	const process =
		'/Applications/Visual Studio Code.app/Contents/MacOS/Code --open-url';

	expect(findMacOsEditorsFromProcessOutput(process)).toContainEqual({
		command: 'code',
		process: '/Applications/Visual Studio Code.app/Contents/MacOS/Code',
	});
});

test('opens source locations in an existing Zed window', async () => {
	const calls: {
		command: string;
		args: readonly string[];
		options: SpawnOptions;
	}[] = [];
	const spawnSpy = spyOn(childProcess, 'spawn').mockImplementation(((
		command: string,
		args: readonly string[],
		options: SpawnOptions,
	) => {
		calls.push({command, args, options});
		return new EventEmitter() as ReturnType<typeof childProcess.spawn>;
	}) as typeof childProcess.spawn);
	const sourceFile = __filename;

	try {
		await launchEditor({
			colNumber: 4,
			editor: {command: 'zed', process: 'zed'},
			fileName: sourceFile,
			lineNumber: 12,
			logLevel: 'error',
			vsCodeNewWindow: false,
		});

		expect(calls).toEqual(
			process.platform === 'win32'
				? [
						{
							args: ['/C', 'zed', '--existing', `${sourceFile}:12:4`],
							command: 'cmd.exe',
							options: {detached: true, stdio: 'inherit'},
						},
					]
				: [
						{
							args: ['--existing', `${sourceFile}:12:4`],
							command: 'zed',
							options: {stdio: 'inherit'},
						},
					],
		);
	} finally {
		spawnSpy.mockRestore();
	}
});

test('finds a property after the component location', () => {
	const contents = [
		'const MyComp = () => (',
		'\t<Sequence',
		'\t\tstyle={{',
		'\t\t\topacity: 0.5,',
		'\t\t}}',
		'\t/>',
		');',
	].join('\n');

	expect(
		findSearchPosition({
			contents,
			lineNumber: 2,
			columnNumber: 2,
			search: 'opacity',
		}),
	).toEqual({lineNumber: 4, columnNumber: 4});
});

test('starts searching at the source column', () => {
	const contents = 'opacity: 1; <Sequence opacity={0.5} />';

	expect(
		findSearchPosition({
			contents,
			lineNumber: 1,
			columnNumber: 13,
			search: 'opacity',
		}),
	).toEqual({lineNumber: 1, columnNumber: 23});
});

test('keeps the component location if the property is not found', () => {
	expect(
		findSearchPosition({
			contents: '<Sequence />',
			lineNumber: 1,
			columnNumber: 2,
			search: 'opacity',
		}),
	).toEqual({lineNumber: 1, columnNumber: 2});
});
