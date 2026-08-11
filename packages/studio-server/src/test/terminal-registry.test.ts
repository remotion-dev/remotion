import {expect, test} from 'bun:test';
import {mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import type {TerminalDiscoveryContext} from '../helpers/terminal-registry';
import {
	discoverAvailableTerminals,
	getTerminalLaunchCommand,
	launchTerminal,
} from '../helpers/terminal-registry';

const makeContext = ({
	platform,
	paths,
	env = {},
	macApplications = {},
}: {
	platform: NodeJS.Platform;
	paths: readonly string[];
	env?: NodeJS.ProcessEnv;
	macApplications?: Record<string, readonly string[]>;
}): TerminalDiscoveryContext => {
	const existingPaths = new Set(paths);
	return {
		platform,
		env,
		homeDirectory: platform === 'win32' ? 'C:\\Users\\test' : '/home/test',
		pathExists: (filePath) => existingPaths.has(filePath),
		findMacApplications: (bundleIdentifier) =>
			Promise.resolve(macApplications[bundleIdentifier] ?? []),
	};
};

test('discovers supported macOS terminals', async () => {
	const terminals = await discoverAvailableTerminals(
		makeContext({
			platform: 'darwin',
			paths: [
				'/Applications/Terminal.app',
				'/Custom/Applications/iTerm.app',
				'/home/test/Applications/Ghostty.app',
			],
			macApplications: {
				'com.googlecode.iterm2': ['/Custom/Applications/iTerm.app'],
			},
		}),
	);

	expect(terminals).toEqual([
		{
			applicationPath: '/Applications/Terminal.app',
			id: 'terminal',
			name: 'Terminal',
			platform: 'darwin',
		},
		{
			applicationPath: '/Custom/Applications/iTerm.app',
			id: 'iterm2',
			name: 'iTerm2',
			platform: 'darwin',
		},
		{
			applicationPath: '/home/test/Applications/Ghostty.app',
			id: 'ghostty',
			name: 'Ghostty',
			platform: 'darwin',
		},
	]);
});

test('discovers supported Linux terminals from known locations and PATH', async () => {
	const terminals = await discoverAvailableTerminals(
		makeContext({
			platform: 'linux',
			paths: [
				'/custom/bin/wezterm',
				'/usr/bin/ghostty',
				'/usr/bin/gnome-terminal',
				'/usr/bin/kitty',
				'/usr/bin/konsole',
			],
			env: {PATH: '/custom/bin:/usr/local/bin'},
		}),
	);

	expect(
		terminals.map(({id, applicationPath}) => ({id, applicationPath})),
	).toEqual([
		{applicationPath: '/usr/bin/ghostty', id: 'ghostty'},
		{applicationPath: '/custom/bin/wezterm', id: 'wezterm'},
		{applicationPath: '/usr/bin/gnome-terminal', id: 'gnome-terminal'},
	]);
});

test('discovers supported Windows terminals', async () => {
	const terminals = await discoverAvailableTerminals(
		makeContext({
			platform: 'win32',
			paths: [
				'C:\\Program Files\\WezTerm\\wezterm-gui.exe',
				'C:\\Users\\test\\AppData\\Local\\Microsoft\\WindowsApps\\wt.exe',
			],
			env: {
				LOCALAPPDATA: 'C:\\Users\\test\\AppData\\Local',
				ProgramFiles: 'C:\\Program Files',
			},
		}),
	);

	expect(
		terminals.map(({id, applicationPath}) => ({id, applicationPath})),
	).toEqual([
		{
			applicationPath: 'C:\\Program Files\\WezTerm\\wezterm-gui.exe',
			id: 'wezterm',
		},
		{
			applicationPath:
				'C:\\Users\\test\\AppData\\Local\\Microsoft\\WindowsApps\\wt.exe',
			id: 'windows-terminal',
		},
	]);
});

test('does not report terminals on unsupported platforms', async () => {
	const terminals = await discoverAvailableTerminals(
		makeContext({platform: 'freebsd', paths: []}),
	);

	expect(terminals).toEqual([]);
});

test('builds platform-specific commands that open the requested folder', () => {
	expect(
		getTerminalLaunchCommand({
			directory: '/project',
			terminal: {
				applicationPath: '/Applications/Terminal.app',
				id: 'terminal',
				name: 'Terminal',
				platform: 'darwin',
			},
		}),
	).toEqual({
		args: ['-a', '/Applications/Terminal.app', '/project'],
		command: 'open',
		cwd: '/project',
	});

	expect(
		getTerminalLaunchCommand({
			directory: '/project',
			terminal: {
				applicationPath: '/Applications/Ghostty.app',
				id: 'ghostty',
				name: 'Ghostty',
				platform: 'darwin',
			},
		}),
	).toEqual({
		args: [
			'-na',
			'/Applications/Ghostty.app',
			'--args',
			'--working-directory=/project',
		],
		command: 'open',
		cwd: '/project',
	});

	expect(
		getTerminalLaunchCommand({
			directory: '/project',
			terminal: {
				applicationPath: '/usr/bin/ghostty',
				id: 'ghostty',
				name: 'Ghostty',
				platform: 'linux',
			},
		}),
	).toEqual({
		args: ['--working-directory=/project'],
		command: '/usr/bin/ghostty',
		cwd: '/project',
	});

	expect(
		getTerminalLaunchCommand({
			directory: 'C:\\project',
			terminal: {
				applicationPath: 'C:\\WindowsApps\\wt.exe',
				id: 'windows-terminal',
				name: 'Windows Terminal',
				platform: 'win32',
			},
		}),
	).toEqual({
		args: ['-d', 'C:\\project'],
		command: 'C:\\WindowsApps\\wt.exe',
		cwd: 'C:\\project',
	});
});

test('refuses to launch a terminal for a file', async () => {
	const temporaryDirectory = mkdtempSync(
		path.join(tmpdir(), 'remotion-terminal-test-'),
	);
	const file = path.join(temporaryDirectory, 'file.ts');
	writeFileSync(file, '');

	try {
		await expect(
			launchTerminal({
				allowedDirectory: temporaryDirectory,
				directory: file,
				terminal: {
					applicationPath: '/Applications/Terminal.app',
					id: 'terminal',
					name: 'Terminal',
					platform: 'darwin',
				},
			}),
		).rejects.toThrow('Only folders can be opened in a terminal.');
	} finally {
		rmSync(temporaryDirectory, {recursive: true});
	}
});
