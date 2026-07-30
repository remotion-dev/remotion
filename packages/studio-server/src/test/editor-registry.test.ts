import {expect, test} from 'bun:test';
import path from 'node:path';
import type {DefaultEditor} from '@remotion/renderer';
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
	windowsApplications = {},
}: {
	platform: NodeJS.Platform;
	paths: readonly string[];
	env?: NodeJS.ProcessEnv;
	macApplications?: Record<string, readonly string[]>;
	windowsApplications?: Partial<Record<DefaultEditor, readonly string[]>>;
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
			Promise.resolve(windowsApplications[editor] ?? []),
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
		{defaultEditor: 'cursor', logLevel: 'info'},
		{
			getInstalledEditors: () => Promise.resolve([cursor]),
			getLegacyEditors: () => {
				legacyDetectionCalls++;
				return Promise.resolve([]);
			},
		},
	);

	expect(resolved).toEqual(cursor);
	expect(legacyDetectionCalls).toBe(0);
});

test('warns once and falls back when the configured editor is unavailable', async () => {
	const warnings: string[] = [];
	const warnedEditors = new Set<DefaultEditor>();
	const dependencies = {
		getInstalledEditors: () => Promise.resolve([]),
		getLegacyEditors: () =>
			Promise.resolve([{command: 'code', process: 'code'}]),
		warn: (message: string) => warnings.push(message),
		warnedEditors,
	};

	const first = await resolveEditor(
		{defaultEditor: 'cursor', logLevel: 'info'},
		dependencies,
	);
	const second = await resolveEditor(
		{defaultEditor: 'cursor', logLevel: 'info'},
		dependencies,
	);

	expect(first).toEqual({
		command: 'code',
		id: null,
		name: 'VS Code',
		process: 'code',
	});
	expect(second).toEqual(first);
	expect(warnings).toEqual([
		`The default editor ${getDefaultEditorName('cursor')} (cursor) is not installed. Falling back to automatic editor detection.`,
	]);
});

test('preserves legacy detection when no default editor is configured', async () => {
	let installedEditorDetectionCalls = 0;
	const resolved = await resolveEditor(
		{defaultEditor: null, logLevel: 'info'},
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
