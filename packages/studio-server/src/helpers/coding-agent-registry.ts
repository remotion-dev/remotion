import {execFile} from 'node:child_process';
import {existsSync} from 'node:fs';
import {homedir} from 'node:os';
import path from 'node:path';
import {promisify} from 'node:util';
import type {DefaultCodingAgent} from '@remotion/renderer';
import {defaultCodingAgentIds} from '@remotion/renderer';

const execFilePromise = promisify(execFile);

export type InstalledCodingAgent = {
	id: DefaultCodingAgent;
	name: string;
	applicationPath: string;
};

type CodingAgentDefinition = {
	name: string;
	bundleIdentifiers: readonly string[];
	applicationNames: readonly string[];
};

const codingAgentDefinitions = {
	codex: {
		name: 'Codex',
		bundleIdentifiers: ['com.openai.codex'],
		applicationNames: ['ChatGPT.app'],
	},
	cursor: {
		name: 'Cursor',
		bundleIdentifiers: ['com.todesktop.230313mzl4w4u92'],
		applicationNames: ['Cursor.app'],
	},
	'github-copilot': {
		name: 'GitHub Copilot',
		bundleIdentifiers: ['com.github.githubapp'],
		applicationNames: ['GitHub Copilot.app'],
	},
	'claude-code': {
		name: 'Claude Code',
		bundleIdentifiers: ['com.anthropic.claudefordesktop'],
		applicationNames: ['Claude.app'],
	},
} satisfies Record<DefaultCodingAgent, CodingAgentDefinition>;

export type CodingAgentDiscoveryContext = {
	platform: NodeJS.Platform;
	homeDirectory: string;
	pathExists: (filePath: string) => boolean;
	findMacApplications: (bundleIdentifier: string) => Promise<readonly string[]>;
};

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

const defaultDiscoveryContext: CodingAgentDiscoveryContext = {
	platform: process.platform,
	homeDirectory: homedir(),
	pathExists: existsSync,
	findMacApplications,
};

export const discoverAvailableCodingAgents = async (
	context: CodingAgentDiscoveryContext,
): Promise<readonly InstalledCodingAgent[]> => {
	if (context.platform !== 'darwin') {
		return [];
	}

	const installedCodingAgents: InstalledCodingAgent[] = [];
	for (const id of defaultCodingAgentIds) {
		const definition = codingAgentDefinitions[id];
		const discoveredApplications = (
			await Promise.all(
				definition.bundleIdentifiers.map((bundleIdentifier) =>
					context.findMacApplications(bundleIdentifier),
				),
			)
		).flat();
		const knownApplications = definition.applicationNames.flatMap((name) => [
			path.posix.join('/Applications', name),
			path.posix.join(context.homeDirectory, 'Applications', name),
		]);

		for (const applicationPath of new Set([
			...discoveredApplications,
			...knownApplications,
		])) {
			if (context.pathExists(applicationPath)) {
				installedCodingAgents.push({
					applicationPath,
					id,
					name: definition.name,
				});
				break;
			}
		}
	}

	return installedCodingAgents;
};

let availableCodingAgents: Promise<readonly InstalledCodingAgent[]> | null =
	null;

export const getAvailableCodingAgents = () => {
	availableCodingAgents ??= discoverAvailableCodingAgents(
		defaultDiscoveryContext,
	);
	return availableCodingAgents;
};
