import {execFile, spawn} from 'node:child_process';
import {existsSync, statSync} from 'node:fs';
import {homedir} from 'node:os';
import path from 'node:path';
import {promisify} from 'node:util';
import type {DefaultTerminal} from '@remotion/renderer';

const execFilePromise = promisify(execFile);

type SupportedTerminalPlatform = 'darwin' | 'linux' | 'win32';

export type InstalledTerminal = {
	id: DefaultTerminal;
	name: string;
	applicationPath: string;
	platform: SupportedTerminalPlatform;
};

type TerminalDefinition = {
	name: string;
	darwin: {
		bundleIdentifiers: readonly string[];
		applicationNames: readonly string[];
	} | null;
	linux: {
		paths: (context: TerminalDiscoveryContext) => readonly string[];
		commands: readonly string[];
	} | null;
	win32: {
		paths: (context: TerminalDiscoveryContext) => readonly string[];
		commands: readonly string[];
	} | null;
};

export type TerminalDiscoveryContext = {
	platform: NodeJS.Platform;
	env: NodeJS.ProcessEnv;
	homeDirectory: string;
	pathExists: (filePath: string) => boolean;
	findMacApplications: (bundleIdentifier: string) => Promise<readonly string[]>;
};

const getWindowsEnvironmentPaths = (
	context: TerminalDiscoveryContext,
	segments: readonly string[],
) => {
	const paths: string[] = [];
	for (const directory of [
		context.env.LOCALAPPDATA,
		context.env.ProgramFiles,
		context.env['ProgramFiles(x86)'],
	]) {
		if (directory) {
			paths.push(path.win32.join(directory, ...segments));
		}
	}

	return paths;
};

const getLinuxCommandPaths = (
	context: TerminalDiscoveryContext,
	command: string,
) => [
	path.posix.join('/usr/local/bin', command),
	path.posix.join('/usr/bin', command),
	path.posix.join(context.homeDirectory, '.local/bin', command),
];

const terminalDefinitions = {
	terminal: {
		name: 'Terminal',
		darwin: {
			bundleIdentifiers: ['com.apple.Terminal'],
			applicationNames: ['Terminal.app'],
		},
		linux: null,
		win32: null,
	},
	iterm2: {
		name: 'iTerm2',
		darwin: {
			bundleIdentifiers: ['com.googlecode.iterm2'],
			applicationNames: ['iTerm.app'],
		},
		linux: null,
		win32: null,
	},
	ghostty: {
		name: 'Ghostty',
		darwin: {
			bundleIdentifiers: ['com.mitchellh.ghostty'],
			applicationNames: ['Ghostty.app'],
		},
		linux: {
			paths: (context) => getLinuxCommandPaths(context, 'ghostty'),
			commands: ['ghostty'],
		},
		win32: null,
	},
	warp: {
		name: 'Warp',
		darwin: {
			bundleIdentifiers: ['dev.warp.Warp-Stable'],
			applicationNames: ['Warp.app'],
		},
		linux: {
			paths: (context) => getLinuxCommandPaths(context, 'warp-terminal'),
			commands: ['warp-terminal'],
		},
		win32: {
			paths: (context) =>
				context.env.LOCALAPPDATA
					? [
							path.win32.join(
								context.env.LOCALAPPDATA,
								'Programs',
								'Warp',
								'Warp.exe',
							),
						]
					: [],
			commands: ['Warp.exe'],
		},
	},
	wezterm: {
		name: 'WezTerm',
		darwin: {
			bundleIdentifiers: ['com.github.wez.wezterm'],
			applicationNames: ['WezTerm.app'],
		},
		linux: {
			paths: (context) => getLinuxCommandPaths(context, 'wezterm'),
			commands: ['wezterm'],
		},
		win32: {
			paths: (context) => [
				...getWindowsEnvironmentPaths(context, ['WezTerm', 'wezterm-gui.exe']),
			],
			commands: ['wezterm-gui.exe', 'wezterm.exe'],
		},
	},
	alacritty: {
		name: 'Alacritty',
		darwin: {
			bundleIdentifiers: ['org.alacritty'],
			applicationNames: ['Alacritty.app'],
		},
		linux: {
			paths: (context) => getLinuxCommandPaths(context, 'alacritty'),
			commands: ['alacritty'],
		},
		win32: {
			paths: (context) =>
				getWindowsEnvironmentPaths(context, ['Alacritty', 'alacritty.exe']),
			commands: ['alacritty.exe'],
		},
	},
	'windows-terminal': {
		name: 'Windows Terminal',
		darwin: null,
		linux: null,
		win32: {
			paths: (context) =>
				context.env.LOCALAPPDATA
					? [
							path.win32.join(
								context.env.LOCALAPPDATA,
								'Microsoft',
								'WindowsApps',
								'wt.exe',
							),
						]
					: [],
			commands: ['wt.exe'],
		},
	},
	'gnome-terminal': {
		name: 'GNOME Terminal',
		darwin: null,
		linux: {
			paths: (context) => getLinuxCommandPaths(context, 'gnome-terminal'),
			commands: ['gnome-terminal'],
		},
		win32: null,
	},
} satisfies Record<DefaultTerminal, TerminalDefinition>;

const findMacApplications = async (
	bundleIdentifier: string,
): Promise<readonly string[]> => {
	try {
		const {stdout} = await execFilePromise('mdfind', [
			`kMDItemCFBundleIdentifier == '${bundleIdentifier}'`,
		]);
		return stdout
			.split('\n')
			.map((line) => line.trim())
			.filter(Boolean);
	} catch {
		return [];
	}
};

const defaultDiscoveryContext: TerminalDiscoveryContext = {
	platform: process.platform,
	env: process.env,
	homeDirectory: homedir(),
	pathExists: existsSync,
	findMacApplications,
};

const getPathDirectories = (context: TerminalDiscoveryContext) => {
	const value = context.env.PATH ?? context.env.Path ?? '';
	return value.split(context.platform === 'win32' ? ';' : ':').filter(Boolean);
};

const findExecutable = ({
	paths,
	commands,
	context,
}: {
	paths: readonly string[];
	commands: readonly string[];
	context: TerminalDiscoveryContext;
}) => {
	for (const executablePath of paths) {
		if (context.pathExists(executablePath)) {
			return executablePath;
		}
	}

	const pathImplementation =
		context.platform === 'win32' ? path.win32 : path.posix;
	for (const directory of getPathDirectories(context)) {
		for (const command of commands) {
			const executablePath = pathImplementation.join(directory, command);
			if (context.pathExists(executablePath)) {
				return executablePath;
			}
		}
	}

	return null;
};

export const discoverAvailableTerminals = async (
	context: TerminalDiscoveryContext,
): Promise<readonly InstalledTerminal[]> => {
	if (
		context.platform !== 'darwin' &&
		context.platform !== 'linux' &&
		context.platform !== 'win32'
	) {
		return [];
	}

	const installedTerminals: InstalledTerminal[] = [];
	for (const [id, definition] of Object.entries(terminalDefinitions) as [
		DefaultTerminal,
		TerminalDefinition,
	][]) {
		const platformDefinition = definition[context.platform];
		if (platformDefinition === null) {
			continue;
		}

		if (context.platform === 'darwin') {
			const darwinDefinition = definition.darwin;
			if (darwinDefinition === null) {
				continue;
			}

			const discoveredApplications = (
				await Promise.all(
					darwinDefinition.bundleIdentifiers.map((bundleIdentifier) =>
						context.findMacApplications(bundleIdentifier),
					),
				)
			).flat();
			const knownApplications = darwinDefinition.applicationNames.flatMap(
				(name) => [
					path.posix.join('/Applications', name),
					path.posix.join(context.homeDirectory, 'Applications', name),
				],
			);
			const macApplicationPath = [
				...new Set([...discoveredApplications, ...knownApplications]),
			].find(context.pathExists);
			if (macApplicationPath) {
				installedTerminals.push({
					applicationPath: macApplicationPath,
					id,
					name: definition.name,
					platform: context.platform,
				});
			}

			continue;
		}

		const executableDefinition = definition[context.platform];
		if (executableDefinition === null) {
			continue;
		}

		const applicationPath = findExecutable({
			paths:
				typeof executableDefinition.paths === 'function'
					? executableDefinition.paths(context)
					: executableDefinition.paths,
			commands: executableDefinition.commands,
			context,
		});
		if (applicationPath) {
			installedTerminals.push({
				applicationPath,
				id,
				name: definition.name,
				platform: context.platform,
			});
		}
	}

	return installedTerminals;
};

let availableTerminals: Promise<readonly InstalledTerminal[]> | null = null;

export const getAvailableTerminals = () => {
	availableTerminals ??= discoverAvailableTerminals(defaultDiscoveryContext);
	return availableTerminals;
};

export const getTerminalLaunchCommand = ({
	terminal,
	directory,
}: {
	terminal: InstalledTerminal;
	directory: string;
}): {command: string; args: string[]; cwd: string} => {
	if (terminal.platform === 'darwin') {
		switch (terminal.id) {
			case 'terminal':
			case 'iterm2':
			case 'warp':
				return {
					command: 'open',
					args: ['-a', terminal.applicationPath, directory],
					cwd: directory,
				};
			case 'ghostty':
				return {
					command: path.posix.join(
						terminal.applicationPath,
						'Contents/MacOS/ghostty',
					),
					args: [`--working-directory=${directory}`],
					cwd: directory,
				};
			case 'wezterm':
				return {
					command: path.posix.join(
						terminal.applicationPath,
						'Contents/MacOS/wezterm',
					),
					args: ['start', '--cwd', directory],
					cwd: directory,
				};
			case 'alacritty':
				return {
					command: path.posix.join(
						terminal.applicationPath,
						'Contents/MacOS/alacritty',
					),
					args: ['--working-directory', directory],
					cwd: directory,
				};
			case 'windows-terminal':
			case 'gnome-terminal':
				throw new Error(`${terminal.name} is not supported on macOS.`);
			default: {
				const invalidTerminal: never = terminal.id;
				throw new Error(`Unknown terminal: ${invalidTerminal}`);
			}
		}
	}

	if (terminal.platform === 'win32') {
		switch (terminal.id) {
			case 'windows-terminal':
				return {
					command: terminal.applicationPath,
					args: ['-d', directory],
					cwd: directory,
				};
			case 'wezterm':
				return {
					command: terminal.applicationPath,
					args: ['start', '--cwd', directory],
					cwd: directory,
				};
			case 'alacritty':
				return {
					command: terminal.applicationPath,
					args: ['--working-directory', directory],
					cwd: directory,
				};
			case 'warp':
				return {
					command: terminal.applicationPath,
					args: [],
					cwd: directory,
				};
			case 'terminal':
			case 'iterm2':
			case 'ghostty':
			case 'gnome-terminal':
				throw new Error(`${terminal.name} is not supported on Windows.`);
			default: {
				const invalidTerminal: never = terminal.id;
				throw new Error(`Unknown terminal: ${invalidTerminal}`);
			}
		}
	}

	switch (terminal.id) {
		case 'ghostty':
			return {
				command: terminal.applicationPath,
				args: [`--working-directory=${directory}`],
				cwd: directory,
			};
		case 'warp':
			return {
				command: terminal.applicationPath,
				args: [],
				cwd: directory,
			};
		case 'wezterm':
			return {
				command: terminal.applicationPath,
				args: ['start', '--cwd', directory],
				cwd: directory,
			};
		case 'alacritty':
			return {
				command: terminal.applicationPath,
				args: ['--working-directory', directory],
				cwd: directory,
			};
		case 'gnome-terminal':
			return {
				command: terminal.applicationPath,
				args: [`--working-directory=${directory}`],
				cwd: directory,
			};
		case 'terminal':
		case 'iterm2':
		case 'windows-terminal':
			throw new Error(`${terminal.name} is not supported on Linux.`);
		default: {
			const invalidTerminal: never = terminal.id;
			throw new Error(`Unknown terminal: ${invalidTerminal}`);
		}
	}
};

export const launchTerminal = async ({
	terminal,
	directory,
	allowedDirectory,
}: {
	terminal: InstalledTerminal;
	directory: string;
	allowedDirectory: string;
}) => {
	const resolvedAllowedDirectory = path.resolve(allowedDirectory);
	const resolvedDirectory = path.resolve(resolvedAllowedDirectory, directory);
	const relativePath = path.relative(
		resolvedAllowedDirectory,
		resolvedDirectory,
	);
	if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
		throw new Error(`Not allowed to open ${relativePath}`);
	}

	if (!statSync(resolvedDirectory).isDirectory()) {
		throw new Error('Only folders can be opened in a terminal.');
	}

	const {command, args, cwd} = getTerminalLaunchCommand({
		terminal,
		directory: resolvedDirectory,
	});
	await new Promise<void>((resolve, reject) => {
		const child = spawn(command, args, {
			cwd,
			detached: true,
			stdio: 'ignore',
		});
		child.once('error', reject);
		child.once('spawn', () => {
			child.unref();
			resolve();
		});
	});
};
