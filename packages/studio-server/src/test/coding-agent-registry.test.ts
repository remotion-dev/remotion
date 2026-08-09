import {expect, test} from 'bun:test';
import type {CodingAgentDiscoveryContext} from '../helpers/coding-agent-registry';
import {discoverAvailableCodingAgents} from '../helpers/coding-agent-registry';

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
}): CodingAgentDiscoveryContext => {
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

const withoutIconData = (
	codingAgents: Awaited<ReturnType<typeof discoverAvailableCodingAgents>>,
) =>
	codingAgents.map(({iconDataUrl, ...codingAgent}) => ({
		...codingAgent,
		hasBundledPngIcon:
			iconDataUrl?.startsWith('data:image/png;base64,') ?? false,
	}));

test('discovers supported macOS coding agents without launching them', async () => {
	const codingAgents = await discoverAvailableCodingAgents(
		makeContext({
			platform: 'darwin',
			paths: [
				'/Custom/Applications/ChatGPT.app',
				'/home/test/Applications/Claude.app',
			],
			macApplications: {
				'com.openai.codex': ['/Custom/Applications/ChatGPT.app'],
			},
		}),
	);

	expect(withoutIconData(codingAgents)).toEqual([
		{
			applicationPath: '/Custom/Applications/ChatGPT.app',
			hasBundledPngIcon: true,
			id: 'codex',
			launchMode: 'direct',
			name: 'Codex',
			nameWithType: 'Codex',
			platform: 'darwin',
			terminal: null,
		},
		{
			applicationPath: '/home/test/Applications/Claude.app',
			hasBundledPngIcon: true,
			id: 'claude-code',
			launchMode: 'direct',
			name: 'Claude Code',
			nameWithType: 'Claude Code',
			platform: 'darwin',
			terminal: null,
		},
	]);
});

test('discovers Linux coding agents and a terminal from known locations and PATH', async () => {
	const codingAgents = await discoverAvailableCodingAgents(
		makeContext({
			platform: 'linux',
			paths: [
				'/custom/bin/codex',
				'/custom/bin/cursor',
				'/custom/bin/copilot',
				'/home/test/.claude/local/claude',
				'/usr/bin/gnome-terminal',
			],
			env: {PATH: '/custom/bin:/usr/local/bin'},
		}),
	);

	expect(
		withoutIconData(codingAgents).map(
			({id, applicationPath, launchMode, platform, terminal}) => ({
				id,
				applicationPath,
				launchMode,
				platform,
				terminal,
			}),
		),
	).toEqual([
		{
			applicationPath: '/custom/bin/codex',
			id: 'codex',
			launchMode: 'terminal',
			platform: 'linux',
			terminal: {id: 'gnome-terminal', path: '/usr/bin/gnome-terminal'},
		},
		{
			applicationPath: '/custom/bin/cursor',
			id: 'cursor',
			launchMode: 'direct',
			platform: 'linux',
			terminal: null,
		},
		{
			applicationPath: '/custom/bin/copilot',
			id: 'copilot',
			launchMode: 'terminal',
			platform: 'linux',
			terminal: {id: 'gnome-terminal', path: '/usr/bin/gnome-terminal'},
		},
		{
			applicationPath: '/home/test/.claude/local/claude',
			id: 'claude-code',
			launchMode: 'terminal',
			platform: 'linux',
			terminal: {id: 'gnome-terminal', path: '/usr/bin/gnome-terminal'},
		},
	]);
});

test('discovers Windows coding agents from install folders and PATH', async () => {
	const cursor =
		'C:\\Users\\test\\AppData\\Local\\Programs\\cursor\\Cursor.exe';
	const codingAgents = await discoverAvailableCodingAgents(
		makeContext({
			platform: 'win32',
			paths: [
				'C:\\Tools\\codex.cmd',
				cursor,
				'C:\\Tools\\copilot.cmd',
				'C:\\Tools\\claude.cmd',
			],
			env: {
				ComSpec: 'C:\\Windows\\System32\\cmd.exe',
				LOCALAPPDATA: 'C:\\Users\\test\\AppData\\Local',
				PATH: 'C:\\Tools;C:\\Windows',
			},
		}),
	);

	expect(
		codingAgents.map(
			({id, applicationPath, launchMode, platform, terminal}) => ({
				id,
				applicationPath,
				launchMode,
				platform,
				terminal,
			}),
		),
	).toEqual([
		{
			applicationPath: 'C:\\Tools\\codex.cmd',
			id: 'codex',
			launchMode: 'terminal',
			platform: 'win32',
			terminal: {id: 'cmd', path: 'C:\\Windows\\System32\\cmd.exe'},
		},
		{
			applicationPath: cursor,
			id: 'cursor',
			launchMode: 'direct',
			platform: 'win32',
			terminal: null,
		},
		{
			applicationPath: 'C:\\Tools\\copilot.cmd',
			id: 'copilot',
			launchMode: 'terminal',
			platform: 'win32',
			terminal: {id: 'cmd', path: 'C:\\Windows\\System32\\cmd.exe'},
		},
		{
			applicationPath: 'C:\\Tools\\claude.cmd',
			id: 'claude-code',
			launchMode: 'terminal',
			platform: 'win32',
			terminal: {id: 'cmd', path: 'C:\\Windows\\System32\\cmd.exe'},
		},
	]);
});

test('does not report coding agents on unsupported platforms', async () => {
	const codingAgents = await discoverAvailableCodingAgents(
		makeContext({platform: 'freebsd', paths: []}),
	);

	expect(codingAgents).toEqual([]);
});
