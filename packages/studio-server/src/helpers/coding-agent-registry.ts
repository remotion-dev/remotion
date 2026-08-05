import {execFile, spawn} from 'node:child_process';
import {existsSync, readFileSync} from 'node:fs';
import {homedir} from 'node:os';
import path from 'node:path';
import {promisify} from 'node:util';
import type {DefaultCodingAgent, LogLevel} from '@remotion/renderer';
import {defaultCodingAgentIds, RenderInternals} from '@remotion/renderer';

const execFilePromise = promisify(execFile);

export type InstalledCodingAgent = {
	id: DefaultCodingAgent;
	name: string;
	applicationPath: string;
	iconDataUrl: string | null;
	platform: SupportedCodingAgentPlatform;
	launchMode: 'direct' | 'terminal';
	terminal: InstalledTerminal | null;
};

type SupportedCodingAgentPlatform = 'darwin' | 'linux' | 'win32';

type LinuxTerminalId =
	| 'x-terminal-emulator'
	| 'gnome-terminal'
	| 'konsole'
	| 'kitty'
	| 'alacritty'
	| 'wezterm'
	| 'xterm';

type InstalledTerminal = {
	id: LinuxTerminalId | 'cmd';
	path: string;
};

type DarwinCodingAgentVariant = {
	bundleIdentifiers: readonly string[];
	applicationNames: readonly string[];
};

type ExecutableCodingAgentVariant = {
	paths: (context: CodingAgentDiscoveryContext) => readonly string[];
	commands: readonly string[];
	launchMode: 'direct' | 'terminal';
};

type CodingAgentDefinition = {
	name: string;
	darwin: DarwinCodingAgentVariant;
	linux: readonly ExecutableCodingAgentVariant[];
	win32: readonly ExecutableCodingAgentVariant[];
};

type LinuxTerminalDefinition = {
	id: LinuxTerminalId;
	paths: readonly string[];
	commands: readonly string[];
};

export type CodingAgentDiscoveryContext = {
	platform: NodeJS.Platform;
	env: NodeJS.ProcessEnv;
	homeDirectory: string;
	pathExists: (filePath: string) => boolean;
	findMacApplications: (bundleIdentifier: string) => Promise<readonly string[]>;
};

const getLinuxCommandPaths = (
	context: CodingAgentDiscoveryContext,
	command: string,
) => [
	path.posix.join('/usr/local/bin', command),
	path.posix.join('/usr/bin', command),
	path.posix.join(context.homeDirectory, '.local/bin', command),
];

const getWindowsCommandPaths = (
	context: CodingAgentDiscoveryContext,
	command: string,
) => [
	path.win32.join(context.homeDirectory, '.local', 'bin', `${command}.exe`),
	path.win32.join(context.homeDirectory, '.local', 'bin', `${command}.cmd`),
];

const getWindowsEnvironmentPaths = (
	context: CodingAgentDiscoveryContext,
	segments: readonly string[],
) => {
	const paths: string[] = [];
	if (context.env.LOCALAPPDATA) {
		paths.push(
			path.win32.join(context.env.LOCALAPPDATA, 'Programs', ...segments),
		);
	}

	for (const directory of [
		context.env.ProgramFiles,
		context.env['ProgramFiles(x86)'],
	]) {
		if (directory) {
			paths.push(path.win32.join(directory, ...segments));
		}
	}

	return paths;
};

const codingAgentDefinitions = {
	codex: {
		name: 'Codex',
		darwin: {
			bundleIdentifiers: ['com.openai.codex'],
			applicationNames: ['ChatGPT.app'],
		},
		linux: [
			{
				paths: (context) => getLinuxCommandPaths(context, 'codex'),
				commands: ['codex'],
				launchMode: 'terminal',
			},
		],
		win32: [
			{
				paths: (context) => [
					...getWindowsCommandPaths(context, 'codex'),
					...(context.env.LOCALAPPDATA
						? [
								path.win32.join(
									context.env.LOCALAPPDATA,
									'OpenAI',
									'Codex',
									'bin',
									'codex.exe',
								),
								path.win32.join(
									context.env.LOCALAPPDATA,
									'Packages',
									'OpenAI.Codex_2p2nqsd0c76g0',
									'LocalCache',
									'Local',
									'OpenAI',
									'Codex',
									'bin',
									'codex.exe',
								),
							]
						: []),
				],
				commands: ['codex.exe', 'codex.cmd'],
				launchMode: 'terminal',
			},
		],
	},
	cursor: {
		name: 'Cursor',
		darwin: {
			bundleIdentifiers: ['com.todesktop.230313mzl4w4u92'],
			applicationNames: ['Cursor.app'],
		},
		linux: [
			{
				paths: (context) => getLinuxCommandPaths(context, 'cursor'),
				commands: ['cursor'],
				launchMode: 'direct',
			},
			{
				paths: (context) => [
					...getLinuxCommandPaths(context, 'cursor-agent'),
					path.posix.join(context.homeDirectory, '.cursor/bin/cursor-agent'),
				],
				commands: ['cursor-agent'],
				launchMode: 'terminal',
			},
		],
		win32: [
			{
				paths: (context) =>
					getWindowsEnvironmentPaths(context, ['cursor', 'Cursor.exe']),
				commands: ['Cursor.exe', 'cursor.cmd'],
				launchMode: 'direct',
			},
			{
				paths: (context) => getWindowsCommandPaths(context, 'cursor-agent'),
				commands: ['cursor-agent.exe', 'cursor-agent.cmd'],
				launchMode: 'terminal',
			},
		],
	},
	copilot: {
		name: 'GitHub Copilot',
		darwin: {
			bundleIdentifiers: ['com.github.githubapp'],
			applicationNames: ['GitHub Copilot.app'],
		},
		linux: [
			{
				paths: (context) => getLinuxCommandPaths(context, 'copilot'),
				commands: ['copilot'],
				launchMode: 'terminal',
			},
		],
		win32: [
			{
				paths: (context) => getWindowsCommandPaths(context, 'copilot'),
				commands: ['copilot.exe', 'copilot.cmd'],
				launchMode: 'terminal',
			},
		],
	},
	'claude-code': {
		name: 'Claude Code',
		darwin: {
			bundleIdentifiers: ['com.anthropic.claudefordesktop'],
			applicationNames: ['Claude.app'],
		},
		linux: [
			{
				paths: (context) => [
					...getLinuxCommandPaths(context, 'claude'),
					path.posix.join(context.homeDirectory, '.claude/local/claude'),
				],
				commands: ['claude'],
				launchMode: 'terminal',
			},
		],
		win32: [
			{
				paths: (context) => getWindowsCommandPaths(context, 'claude'),
				commands: ['claude.exe', 'claude.cmd'],
				launchMode: 'terminal',
			},
		],
	},
} satisfies Record<DefaultCodingAgent, CodingAgentDefinition>;

const linuxTerminalDefinitions: readonly LinuxTerminalDefinition[] = [
	{
		id: 'x-terminal-emulator',
		paths: ['/usr/bin/x-terminal-emulator'],
		commands: ['x-terminal-emulator'],
	},
	{
		id: 'gnome-terminal',
		paths: ['/usr/bin/gnome-terminal'],
		commands: ['gnome-terminal'],
	},
	{
		id: 'konsole',
		paths: ['/usr/bin/konsole'],
		commands: ['konsole'],
	},
	{id: 'kitty', paths: ['/usr/bin/kitty'], commands: ['kitty']},
	{id: 'alacritty', paths: ['/usr/bin/alacritty'], commands: ['alacritty']},
	{id: 'wezterm', paths: ['/usr/bin/wezterm'], commands: ['wezterm']},
	{id: 'xterm', paths: ['/usr/bin/xterm'], commands: ['xterm']},
];

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

const getBundledCodingAgentIconDataUrl = (id: DefaultCodingAgent): string =>
	`data:image/png;base64,${readFileSync(
		path.join(__dirname, '..', '..', 'web', 'coding-agent-icons', `${id}.png`),
	).toString('base64')}`;

const defaultDiscoveryContext: CodingAgentDiscoveryContext = {
	platform: process.platform,
	env: process.env,
	homeDirectory: homedir(),
	pathExists: existsSync,
	findMacApplications,
};

const getPathDirectories = (context: CodingAgentDiscoveryContext) => {
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
	context: CodingAgentDiscoveryContext;
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

const findLinuxTerminal = (
	context: CodingAgentDiscoveryContext,
): InstalledTerminal | null => {
	for (const definition of linuxTerminalDefinitions) {
		const terminalPath = findExecutable({
			paths: definition.paths,
			commands: definition.commands,
			context,
		});
		if (terminalPath) {
			return {id: definition.id, path: terminalPath};
		}
	}

	return null;
};

export const discoverAvailableCodingAgents = async (
	context: CodingAgentDiscoveryContext,
): Promise<readonly InstalledCodingAgent[]> => {
	if (
		context.platform !== 'darwin' &&
		context.platform !== 'linux' &&
		context.platform !== 'win32'
	) {
		return [];
	}

	const {platform} = context;
	const terminal: InstalledTerminal | null =
		platform === 'linux'
			? findLinuxTerminal(context)
			: platform === 'win32'
				? {
						id: 'cmd',
						path: context.env.ComSpec ?? context.env.COMSPEC ?? 'cmd.exe',
					}
				: null;
	const installedCodingAgents: Omit<InstalledCodingAgent, 'iconDataUrl'>[] = [];
	for (const id of defaultCodingAgentIds) {
		const definition = codingAgentDefinitions[id];
		if (platform === 'darwin') {
			const discoveredApplications = (
				await Promise.all(
					definition.darwin.bundleIdentifiers.map((bundleIdentifier) =>
						context.findMacApplications(bundleIdentifier),
					),
				)
			).flat();
			const knownApplications = definition.darwin.applicationNames.flatMap(
				(name) => [
					path.posix.join('/Applications', name),
					path.posix.join(context.homeDirectory, 'Applications', name),
				],
			);

			for (const applicationPath of new Set([
				...discoveredApplications,
				...knownApplications,
			])) {
				if (context.pathExists(applicationPath)) {
					installedCodingAgents.push({
						applicationPath,
						id,
						launchMode: 'direct',
						name: definition.name,
						platform,
						terminal: null,
					});
					break;
				}
			}

			continue;
		}

		for (const variant of definition[platform]) {
			if (variant.launchMode === 'terminal' && terminal === null) {
				continue;
			}

			const applicationPath = findExecutable({
				paths: variant.paths(context),
				commands: variant.commands,
				context,
			});
			if (applicationPath) {
				installedCodingAgents.push({
					applicationPath,
					id,
					launchMode: variant.launchMode,
					name: definition.name,
					platform,
					terminal: variant.launchMode === 'terminal' ? terminal : null,
				});
				break;
			}
		}
	}

	return installedCodingAgents.map((codingAgent) => ({
		...codingAgent,
		iconDataUrl: getBundledCodingAgentIconDataUrl(codingAgent.id),
	}));
};

let availableCodingAgents: Promise<readonly InstalledCodingAgent[]> | null =
	null;

export const getAvailableCodingAgents = () => {
	availableCodingAgents ??= discoverAvailableCodingAgents(
		defaultDiscoveryContext,
	);
	return availableCodingAgents;
};

export const getCodingAgentLaunchCommand = ({
	codingAgent,
	projectPath,
}: {
	codingAgent: InstalledCodingAgent;
	projectPath: string;
}): {command: string; args: string[]; cwd: string | null} => {
	if (codingAgent.platform === 'darwin') {
		switch (codingAgent.id) {
			case 'codex':
				return {
					command: path.join(
						codingAgent.applicationPath,
						'Contents/Resources/codex',
					),
					args: ['app', projectPath],
					cwd: null,
				};
			case 'cursor':
				return {
					command: path.join(
						codingAgent.applicationPath,
						'Contents/Resources/app/bin/cursor',
					),
					args: ['--glass', '--suppress-popups-on-startup', projectPath],
					cwd: null,
				};
			case 'copilot':
			case 'claude-code':
				return {
					command: 'open',
					args: ['-a', codingAgent.applicationPath, projectPath],
					cwd: null,
				};
			default: {
				const invalidId: never = codingAgent.id;
				throw new Error(`Unknown coding agent: ${invalidId}`);
			}
		}
	}

	if (codingAgent.launchMode === 'direct') {
		return {
			command: codingAgent.applicationPath,
			args:
				codingAgent.id === 'cursor'
					? ['--glass', '--suppress-popups-on-startup', projectPath]
					: [projectPath],
			cwd: null,
		};
	}

	if (codingAgent.terminal === null) {
		throw new Error(`No terminal found for coding agent ${codingAgent.name}`);
	}

	if (codingAgent.terminal.id === 'cmd') {
		return {
			command: codingAgent.terminal.path,
			args: [
				'/d',
				'/s',
				'/c',
				'start',
				'',
				'/d',
				projectPath,
				codingAgent.terminal.path,
				'/k',
				codingAgent.applicationPath,
			],
			cwd: null,
		};
	}

	const command = codingAgent.applicationPath;
	switch (codingAgent.terminal.id) {
		case 'gnome-terminal':
			return {
				command: codingAgent.terminal.path,
				args: [`--working-directory=${projectPath}`, '--', command],
				cwd: projectPath,
			};
		case 'konsole':
			return {
				command: codingAgent.terminal.path,
				args: ['--workdir', projectPath, '-e', command],
				cwd: projectPath,
			};
		case 'kitty':
			return {
				command: codingAgent.terminal.path,
				args: ['--directory', projectPath, command],
				cwd: projectPath,
			};
		case 'alacritty':
			return {
				command: codingAgent.terminal.path,
				args: ['--working-directory', projectPath, '-e', command],
				cwd: projectPath,
			};
		case 'wezterm':
			return {
				command: codingAgent.terminal.path,
				args: ['start', '--cwd', projectPath, '--', command],
				cwd: projectPath,
			};
		case 'x-terminal-emulator':
		case 'xterm':
			return {
				command: codingAgent.terminal.path,
				args: ['-e', command],
				cwd: projectPath,
			};
		default: {
			const invalidTerminal: never = codingAgent.terminal.id;
			throw new Error(`Unknown terminal: ${invalidTerminal}`);
		}
	}
};

export const launchCodingAgent = ({
	codingAgent,
	projectPath,
	logLevel,
}: {
	codingAgent: InstalledCodingAgent;
	projectPath: string;
	logLevel: LogLevel;
}): Promise<boolean> => {
	const {command, args, cwd} = getCodingAgentLaunchCommand({
		codingAgent,
		projectPath,
	});

	return new Promise<boolean>((resolve) => {
		try {
			const child = spawn(command, args, {
				cwd: cwd ?? undefined,
				detached: true,
				shell: false,
				stdio: 'ignore',
			});
			child.once('error', (error) => {
				RenderInternals.Log.error(
					{indent: false, logLevel},
					`Could not launch coding agent ${codingAgent.name}:`,
					error,
				);
				resolve(false);
			});
			child.once('spawn', () => {
				child.unref();
				resolve(true);
			});
		} catch (error) {
			RenderInternals.Log.error(
				{indent: false, logLevel},
				`Could not launch coding agent ${codingAgent.name}:`,
				error,
			);
			resolve(false);
		}
	});
};
