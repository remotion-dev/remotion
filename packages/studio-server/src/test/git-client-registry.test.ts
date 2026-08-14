import {expect, test} from 'bun:test';
import {mkdtempSync, mkdirSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import type {GitClientDiscoveryContext} from '../helpers/git-client-registry';
import {
	discoverAvailableGitClients,
	getGitClientLaunchInstruction,
} from '../helpers/git-client-registry';

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
}): GitClientDiscoveryContext => {
	const existingPaths = new Set(paths);
	return {
		platform,
		env,
		homeDirectory: platform === 'win32' ? 'C:\\Users\\test' : '/Users/test',
		pathExists: (filePath) => existingPaths.has(filePath),
		findMacApplications: (bundleIdentifier) =>
			Promise.resolve(macApplications[bundleIdentifier] ?? []),
		findWindowsApplications: (directory) => [
			`${directory}\\app-3.5.4\\GitHubDesktop.exe`,
		],
	};
};

test('discovers GitHub Desktop and builds platform-specific launch instructions', async () => {
	const repositoryRoot = mkdtempSync(
		path.join(tmpdir(), 'remotion-git-client-test-'),
	);
	const remotionRoot = path.join(repositoryRoot, 'packages', 'example');
	mkdirSync(path.join(repositoryRoot, '.git'));
	mkdirSync(remotionRoot, {recursive: true});

	const macClients = await discoverAvailableGitClients(
		makeContext({
			platform: 'darwin',
			paths: ['/Custom/GitHub Desktop.app'],
			macApplications: {
				'com.github.GitHubClient': ['/Custom/GitHub Desktop.app'],
			},
		}),
	);
	expect(macClients).toEqual([
		{
			applicationPath: '/Custom/GitHub Desktop.app',
			id: 'github-desktop',
			name: 'GitHub Desktop',
			platform: 'darwin',
		},
	]);
	expect(
		getGitClientLaunchInstruction({
			gitClient: macClients[0],
			remotionRoot,
		}),
	).toEqual({
		args: [
			'-n',
			'/Custom/GitHub Desktop.app',
			'--args',
			`--cli-open=${repositoryRoot}`,
		],
		command: 'open',
	});

	const windowsClients = await discoverAvailableGitClients(
		makeContext({
			platform: 'win32',
			env: {LOCALAPPDATA: 'C:\\Users\\test\\AppData\\Local'},
			paths: [
				'C:\\Users\\test\\AppData\\Local\\GitHubDesktop\\app-3.5.4\\GitHubDesktop.exe',
			],
		}),
	);
	expect(
		getGitClientLaunchInstruction({
			gitClient: windowsClients[0],
			remotionRoot,
		}),
	).toEqual({
		args: [`--cli-open=${repositoryRoot}`],
		command:
			'C:\\Users\\test\\AppData\\Local\\GitHubDesktop\\app-3.5.4\\GitHubDesktop.exe',
	});

	expect(
		await discoverAvailableGitClients(
			makeContext({platform: 'linux', paths: ['/usr/bin/github-desktop']}),
		),
	).toEqual([]);

	rmSync(repositoryRoot, {recursive: true});
});
