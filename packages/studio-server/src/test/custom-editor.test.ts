import {expect, test} from 'bun:test';
import {
	chmodSync,
	existsSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import type {CustomEditor} from '@remotion/renderer';
import {
	expandCustomEditorArguments,
	normalizeCustomEditorTargetPath,
	resolveCustomEditorExecutable,
	type CustomEditorResolutionContext,
} from '../helpers/custom-editor';
import {openInEditorHandler} from '../preview-server/routes/open-in-editor';

const editor = (executable: string): CustomEditor => ({
	type: 'custom',
	name: 'Acme Editor',
	executable,
	arguments: ['%TARGET_PATH%'],
});

const makeResolutionContext = ({
	platform,
	env,
	paths,
	executablePaths,
}: {
	platform: NodeJS.Platform;
	env: NodeJS.ProcessEnv;
	paths: Record<
		string,
		Exclude<ReturnType<CustomEditorResolutionContext['inspectPath']>, null>
	>;
	executablePaths: readonly string[] | null;
}): CustomEditorResolutionContext => ({
	platform,
	env,
	currentWorkingDirectory:
		platform === 'win32' ? 'C:\\project' : '/home/project',
	inspectPath: (filePath) => paths[filePath] ?? null,
	canExecute: (filePath) =>
		(executablePaths ?? Object.keys(paths)).includes(filePath),
});

test('resolves commands, Windows executables, and macOS app bundles without a shell', () => {
	expect(
		resolveCustomEditorExecutable(
			editor('acme'),
			makeResolutionContext({
				platform: 'linux',
				env: {PATH: '/usr/local/bin:/usr/bin'},
				paths: {'/usr/local/bin/acme': 'file'},
				executablePaths: null,
			}),
		),
	).toEqual({
		executable: '/usr/local/bin/acme',
		spawnAsMacApplication: false,
	});

	expect(
		resolveCustomEditorExecutable(
			editor('acme'),
			makeResolutionContext({
				platform: 'win32',
				env: {PATH: 'C:\\Tools', PATHEXT: '.CMD;.EXE'},
				paths: {'C:\\Tools\\acme.exe': 'file'},
				executablePaths: null,
			}),
		),
	).toEqual({
		executable: 'C:\\Tools\\acme.exe',
		spawnAsMacApplication: false,
	});

	expect(
		resolveCustomEditorExecutable(
			editor('/Applications/Acme Editor.app'),
			makeResolutionContext({
				platform: 'darwin',
				env: {},
				paths: {'/Applications/Acme Editor.app': 'directory'},
				executablePaths: null,
			}),
		),
	).toEqual({
		executable: '/Applications/Acme Editor.app',
		spawnAsMacApplication: true,
	});

	expect(
		resolveCustomEditorExecutable(
			editor('C:\\Tools\\acme.cmd'),
			makeResolutionContext({
				platform: 'win32',
				env: {},
				paths: {'C:\\Tools\\acme.cmd': 'file'},
				executablePaths: null,
			}),
		),
	).toBeNull();

	expect(
		resolveCustomEditorExecutable(
			editor('/opt/acme/editor'),
			makeResolutionContext({
				platform: 'linux',
				env: {},
				paths: {'/opt/acme/editor': 'file'},
				executablePaths: [],
			}),
		),
	).toBeNull();

	expect(
		resolveCustomEditorExecutable(
			editor('missing-editor'),
			makeResolutionContext({
				platform: 'linux',
				env: {PATH: '/usr/bin'},
				paths: {},
				executablePaths: null,
			}),
		),
	).toBeNull();
});

test('expands each placeholder without reparsing argument tokens', () => {
	expect(
		expandCustomEditorArguments({
			argumentTemplates: [
				'--goto',
				'%TARGET_PATH%:%LINE_NUMBER%:%COLUMN_NUMBER%',
				'"%TARGET_PATH%"',
			],
			targetPath: '/tmp/a project/with "quotes".tsx',
			lineNumber: 12,
			columnNumber: 4,
		}),
	).toEqual([
		'--goto',
		'/tmp/a project/with "quotes".tsx:12:4',
		'"/tmp/a project/with "quotes".tsx"',
	]);
});

test('uses a relative target path for Windows editors launched through WSL', () => {
	expect(
		normalizeCustomEditorTargetPath({
			targetPath: '/mnt/c/Users/test/project/video.tsx',
			platform: 'linux',
			release: '5.15.0-Microsoft-standard-WSL2',
			currentWorkingDirectory: '/mnt/c/Users/test/project',
		}),
	).toBe('video.tsx');
});

test.skipIf(process.platform === 'win32')(
	'opens a source location through the route using the configured custom editor',
	async () => {
		const directory = mkdtempSync(
			path.join(tmpdir(), 'remotion-custom-editor-'),
		);
		const executable = path.join(directory, 'acme editor');
		const output = path.join(directory, 'received arguments.txt');
		const source = path.join(directory, 'source file.tsx');
		writeFileSync(
			executable,
			'#!/bin/sh\noutput="$1"\nshift\nprintf "%s\\n" "$@" > "$output"\n',
		);
		chmodSync(executable, 0o755);
		writeFileSync(source, 'export const Component = () => null;\n');

		try {
			const response = await openInEditorHandler({
				binariesDirectory: null,
				configFile: null,
				entryPoint: '',
				getDefaultCodingAgent: () => null,
				getDefaultEditor: () => ({
					type: 'custom',
					name: 'Acme Editor',
					executable,
					arguments: [output, '%TARGET_PATH%:%LINE_NUMBER%:%COLUMN_NUMBER%'],
				}),
				input: {
					editorId: 'custom',
					stack: {
						originalFileName: path.basename(source),
						originalLineNumber: 12,
						originalColumnNumber: 4,
					} as never,
				},
				logLevel: 'error',
				methods: {
					addJob: () => undefined,
					cancelJob: () => undefined,
					removeJob: () => undefined,
				},
				publicDir: '',
				remotionRoot: directory,
				request: {} as never,
				response: {} as never,
			});

			expect(response).toEqual({success: true});
			for (let attempt = 0; attempt < 100 && !existsSync(output); attempt++) {
				await Bun.sleep(10);
			}

			expect(readFileSync(output, 'utf8')).toBe(`${source}:12:4\n`);
		} finally {
			rmSync(directory, {force: true, recursive: true});
		}
	},
);

test('rejects an unknown editor ID at the open-in-editor route', async () => {
	const response = await openInEditorHandler({
		binariesDirectory: null,
		configFile: null,
		entryPoint: '',
		getDefaultCodingAgent: () => null,
		getDefaultEditor: () => null,
		input: {
			editorId: 'unknown-editor' as never,
			stack: {
				originalFileName: 'source.tsx',
				originalLineNumber: 1,
				originalColumnNumber: 1,
			} as never,
		},
		logLevel: 'error',
		methods: {
			addJob: () => undefined,
			cancelJob: () => undefined,
			removeJob: () => undefined,
		},
		publicDir: '',
		remotionRoot: '/project',
		request: {} as never,
		response: {} as never,
	});

	expect(response).toEqual({success: false});
});
