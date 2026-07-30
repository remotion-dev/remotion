import {expect, test} from 'bun:test';
import path from 'node:path';
import type {BuiltInEditor} from '@remotion/renderer';
import {
	discoverAvailableEditors,
	getDefaultEditorName,
} from '../helpers/editor-registry';
import type {
	EditorDiscoveryContext,
	InstalledEditor,
} from '../helpers/editor-registry';
import {resolveEditor} from '../helpers/resolve-editor';

const makeContext = ({
	platform,
	paths,
	env = {},
	macApplications = {},
	windowsApplications,
}: {
	platform: NodeJS.Platform;
	paths: readonly string[];
	env?: NodeJS.ProcessEnv;
	macApplications?: Record<string, readonly string[]>;
	windowsApplications: Partial<Record<BuiltInEditor, readonly string[]>> | null;
}): EditorDiscoveryContext => {
	const existingPaths = new Set(paths);
	return {
		platform,
		env,
		homeDirectory: platform === 'win32' ? 'C:\\Users\\test' : '/home/test',
		pathExists: (filePath) => existingPaths.has(filePath),
		findMacApplications: (bundleIdentifier) =>
			Promise.resolve(macApplications[bundleIdentifier] ?? []),
		findWindowsApplications: (editor) =>
			Promise.resolve(windowsApplications?.[editor] ?? []),
	};
};

test('discovers installed macOS editors by bundle ID without running them', async () => {
	const cursorApplication = '/Custom/Applications/Cursor.app';
	const cursorExecutable = path.join(
		cursorApplication,
		'Contents/Resources/app/bin/cursor',
	);
	const editors = await discoverAvailableEditors(
		makeContext({
			platform: 'darwin',
			paths: [cursorApplication, cursorExecutable],
			windowsApplications: null,
			macApplications: {
				'com.todesktop.230313mzl4w4u92': [cursorApplication],
			},
		}),
	);

	expect(editors).toEqual([
		{
			command: 'cursor',
			id: 'cursor',
			name: 'Cursor',
			process: cursorExecutable,
		},
	]);
});

test('discovers installed Linux editors from known locations and PATH', async () => {
	const editors = await discoverAvailableEditors(
		makeContext({
			platform: 'linux',
			paths: ['/custom/bin/code', '/home/test/.local/bin/zed'],
			env: {PATH: '/custom/bin:/usr/local/bin'},
			windowsApplications: null,
		}),
	);

	expect(editors.map(({id, process}) => ({id, process}))).toEqual([
		{id: 'vscode', process: '/custom/bin/code'},
		{id: 'zed', process: '/home/test/.local/bin/zed'},
	]);
});

test('discovers installed Windows editors from install folders and PATH', async () => {
	const windsurf = path.win32.join(
		'C:\\Users\\test\\AppData\\Local',
		'Programs',
		'Windsurf',
		'Windsurf.exe',
	);
	const sublime = path.win32.join('C:\\Tools', 'subl.exe');
	const webstorm = 'D:\\JetBrains\\WebStorm\\bin\\webstorm64.exe';
	const editors = await discoverAvailableEditors(
		makeContext({
			platform: 'win32',
			paths: [windsurf, sublime, webstorm],
			env: {
				LOCALAPPDATA: 'C:\\Users\\test\\AppData\\Local',
				PATH: 'C:\\Tools;C:\\Windows',
			},
			windowsApplications: {webstorm: [webstorm]},
		}),
	);

	expect(editors.map(({id, process}) => ({id, process}))).toEqual([
		{id: 'windsurf', process: windsurf},
		{id: 'webstorm', process: webstorm},
		{id: 'sublime-text', process: sublime},
	]);
});

test('uses the configured installed editor instead of legacy detection', async () => {
	const cursor: InstalledEditor = {
		command: '/usr/bin/cursor',
		id: 'cursor',
		name: 'Cursor',
		process: '/usr/bin/cursor',
	};
	let legacyDetectionCalls = 0;

	const resolved = await resolveEditor(
		{defaultEditor: 'cursor', logLevel: 'info', preferredEditor: null},
		{
			getInstalledEditors: () => Promise.resolve([cursor]),
			getLegacyEditors: () => {
				legacyDetectionCalls++;
				return Promise.resolve([]);
			},
		},
	);

	expect(resolved).toEqual({...cursor, type: 'built-in'});
	expect(legacyDetectionCalls).toBe(0);
});

test('uses the editor selected by the picker without changing the default', async () => {
	const vscode: InstalledEditor = {
		command: '/usr/bin/code',
		id: 'vscode',
		name: 'VS Code',
		process: '/usr/bin/code',
	};
	const cursor: InstalledEditor = {
		command: '/usr/bin/cursor',
		id: 'cursor',
		name: 'Cursor',
		process: '/usr/bin/cursor',
	};
	let legacyDetectionCalls = 0;

	const resolved = await resolveEditor(
		{
			defaultEditor: 'vscode',
			logLevel: 'info',
			preferredEditor: 'cursor',
		},
		{
			getInstalledEditors: () => Promise.resolve([vscode, cursor]),
			getLegacyEditors: () => {
				legacyDetectionCalls++;
				return Promise.resolve([]);
			},
		},
	);

	expect(resolved).toEqual({...cursor, type: 'built-in'});
	expect(legacyDetectionCalls).toBe(0);
});

test('does not fall back when the editor selected by the picker is unavailable', async () => {
	let legacyDetectionCalls = 0;

	const resolved = await resolveEditor(
		{
			defaultEditor: 'vscode',
			logLevel: 'info',
			preferredEditor: 'cursor',
		},
		{
			getInstalledEditors: () => Promise.resolve([]),
			getLegacyEditors: () => {
				legacyDetectionCalls++;
				return Promise.resolve([{command: 'code', process: 'code'}]);
			},
		},
	);

	expect(resolved).toBeNull();
	expect(legacyDetectionCalls).toBe(0);
});

test('resolves a custom editor without exposing it to built-in discovery', async () => {
	let installedEditorDetectionCalls = 0;
	const customEditor = {
		type: 'custom',
		name: 'Acme Editor',
		executable: '/opt/acme/editor',
		arguments: ['--goto', '%TARGET_PATH%:%LINE_NUMBER%:%COLUMN_NUMBER%'],
	} as const;
	const resolved = await resolveEditor(
		{defaultEditor: customEditor, logLevel: 'info', preferredEditor: null},
		{
			getInstalledEditors: () => {
				installedEditorDetectionCalls++;
				return Promise.resolve([]);
			},
			resolveCustomEditor: () => ({
				executable: '/opt/acme/editor',
				spawnAsMacApplication: false,
			}),
		},
	);

	expect(installedEditorDetectionCalls).toBe(0);
	expect(resolved).toEqual({
		type: 'custom',
		id: 'custom',
		name: 'Acme Editor',
		editor: customEditor,
		executable: '/opt/acme/editor',
		spawnAsMacApplication: false,
	});
});

test('warns and falls back when a custom editor executable is unavailable', async () => {
	const warnings: string[] = [];
	const resolved = await resolveEditor(
		{
			defaultEditor: {
				type: 'custom',
				name: 'Acme Editor',
				executable: '/missing/acme',
				arguments: ['%TARGET_PATH%'],
			},
			logLevel: 'info',
			preferredEditor: null,
		},
		{
			getLegacyEditors: () =>
				Promise.resolve([{command: 'code', process: 'code'}]),
			resolveCustomEditor: () => null,
			warn: (message) => warnings.push(message),
			warnedEditors: new Set(),
		},
	);

	expect(resolved?.name).toBe('VS Code');
	expect(warnings).toEqual([
		'The executable for custom editor Acme Editor (/missing/acme) was not found or is not executable. Falling back to automatic editor detection.',
	]);
});

test('warns once and falls back when the configured editor is unavailable', async () => {
	const warnings: string[] = [];
	const warnedEditors = new Set<string>();
	const dependencies = {
		getInstalledEditors: () => Promise.resolve([]),
		getLegacyEditors: () =>
			Promise.resolve([{command: 'code', process: 'code'}]),
		warn: (message: string) => warnings.push(message),
		warnedEditors,
	};

	const first = await resolveEditor(
		{defaultEditor: 'cursor', logLevel: 'info', preferredEditor: null},
		dependencies,
	);
	const second = await resolveEditor(
		{defaultEditor: 'cursor', logLevel: 'info', preferredEditor: null},
		dependencies,
	);

	expect(first).toEqual({
		command: 'code',
		id: null,
		name: 'VS Code',
		process: 'code',
		type: 'built-in',
	});
	expect(second).toEqual(first);
	expect(warnings).toEqual([
		`The default editor ${getDefaultEditorName('cursor')} (cursor) is not installed. Falling back to automatic editor detection.`,
	]);
});

test('preserves legacy detection when no default editor is configured', async () => {
	let installedEditorDetectionCalls = 0;
	const resolved = await resolveEditor(
		{defaultEditor: null, logLevel: 'info', preferredEditor: null},
		{
			getInstalledEditors: () => {
				installedEditorDetectionCalls++;
				return Promise.resolve([]);
			},
			getLegacyEditors: () =>
				Promise.resolve([
					{command: 'Windsurf.exe', process: 'C:\\Windsurf.exe'},
				]),
		},
	);

	expect(installedEditorDetectionCalls).toBe(0);
	expect(resolved?.name).toBe('Windsurf');
});
