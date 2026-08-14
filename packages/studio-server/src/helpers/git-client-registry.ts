import {execFile, spawn} from 'node:child_process';
import {existsSync, readdirSync} from 'node:fs';
import {homedir} from 'node:os';
import path from 'node:path';
import {promisify} from 'node:util';
import type {GitClientId} from '@remotion/studio-shared';

const execFilePromise = promisify(execFile);

type SupportedGitClientPlatform = 'darwin' | 'win32';

export type InstalledGitClient = {
	id: GitClientId;
	name: string;
	applicationPath: string;
	platform: SupportedGitClientPlatform;
};

export type GitClientDiscoveryContext = {
	platform: NodeJS.Platform;
	env: NodeJS.ProcessEnv;
	homeDirectory: string;
	pathExists: (filePath: string) => boolean;
	findMacApplications: (bundleIdentifier: string) => Promise<readonly string[]>;
	findWindowsApplications: (directory: string) => readonly string[];
};

const findMacApplications = async (bundleIdentifier: string) => {
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

const defaultDiscoveryContext: GitClientDiscoveryContext = {
	platform: process.platform,
	env: process.env,
	homeDirectory: homedir(),
	pathExists: existsSync,
	findMacApplications,
	findWindowsApplications: (directory) => {
		try {
			return readdirSync(directory, {withFileTypes: true})
				.filter((entry) => entry.isDirectory() && entry.name.startsWith('app-'))
				.map((entry) =>
					path.win32.join(directory, entry.name, 'GitHubDesktop.exe'),
				)
				.sort()
				.reverse();
		} catch {
			return [];
		}
	},
};

export const discoverAvailableGitClients = async (
	context: GitClientDiscoveryContext,
): Promise<readonly InstalledGitClient[]> => {
	if (context.platform === 'darwin') {
		const discoveredApplications = await context.findMacApplications(
			'com.github.GitHubClient',
		);
		const applicationPath = [
			...new Set([
				...discoveredApplications,
				'/Applications/GitHub Desktop.app',
				path.posix.join(
					context.homeDirectory,
					'Applications/GitHub Desktop.app',
				),
			]),
		].find(context.pathExists);

		return applicationPath
			? [
					{
						applicationPath,
						id: 'github-desktop',
						name: 'GitHub Desktop',
						platform: 'darwin',
					},
				]
			: [];
	}

	if (context.platform === 'win32' && context.env.LOCALAPPDATA) {
		const installationDirectory = path.win32.join(
			context.env.LOCALAPPDATA,
			'GitHubDesktop',
		);
		const applicationPath = context
			.findWindowsApplications(installationDirectory)
			.find(context.pathExists);
		return applicationPath
			? [
					{
						applicationPath,
						id: 'github-desktop',
						name: 'GitHub Desktop',
						platform: 'win32',
					},
				]
			: [];
	}

	return [];
};

let availableGitClients: Promise<readonly InstalledGitClient[]> | null = null;

export const getAvailableGitClients = () => {
	availableGitClients ??= discoverAvailableGitClients(defaultDiscoveryContext);
	return availableGitClients;
};

export const getGitClientLaunchInstruction = ({
	gitClient,
	projectPath,
}: {
	gitClient: InstalledGitClient;
	projectPath: string;
}) => {
	return gitClient.platform === 'darwin'
		? {
				command: 'open',
				args: ['-a', gitClient.applicationPath, projectPath],
			}
		: {command: gitClient.applicationPath, args: [projectPath]};
};

export const launchGitClient = async ({
	gitClient,
	projectPath,
}: {
	gitClient: InstalledGitClient;
	projectPath: string;
}) => {
	const {command, args} = getGitClientLaunchInstruction({
		gitClient,
		projectPath,
	});
	await new Promise<void>((resolve, reject) => {
		const child = spawn(command, args, {
			cwd: projectPath,
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
