import {execFile, spawn} from 'node:child_process';
import {existsSync, mkdtempSync, readFileSync, rmSync} from 'node:fs';
import {homedir, tmpdir} from 'node:os';
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
	copilot: {
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
	getIconDataUrl: (
		id: DefaultCodingAgent,
		applicationPath: string,
	) => Promise<string | null>;
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

const getMacApplicationIconDataUrl = async (
	_id: DefaultCodingAgent,
	applicationPath: string,
): Promise<string | null> => {
	const temporaryDirectory = mkdtempSync(
		path.join(tmpdir(), 'remotion-coding-agent-icon-'),
	);
	const macOsIconPath = path.join(temporaryDirectory, 'macos-icon.png');
	const outputPath = path.join(temporaryDirectory, 'icon.png');
	try {
		await execFilePromise('/usr/bin/osascript', [
			'-l',
			'JavaScript',
			'-e',
			`ObjC.import('AppKit');
function run(argv) {
	const icon = $.NSWorkspace.sharedWorkspace.iconForFile(argv[0]);
	const bitmap = $.NSBitmapImageRep.imageRepWithData(icon.TIFFRepresentation);
	const png = bitmap.representationUsingTypeProperties(
		$.NSBitmapImageFileTypePNG,
		$({}),
	);
	return png.writeToFileAtomically(argv[1], true);
}`,
			applicationPath,
			macOsIconPath,
		]);
		await execFilePromise('/usr/bin/sips', [
			'-s',
			'format',
			'png',
			'-z',
			'64',
			'64',
			macOsIconPath,
			'--out',
			outputPath,
		]);
		return `data:image/png;base64,${readFileSync(outputPath).toString('base64')}`;
	} catch {
		return null;
	} finally {
		rmSync(temporaryDirectory, {force: true, recursive: true});
	}
};

const defaultDiscoveryContext: CodingAgentDiscoveryContext = {
	platform: process.platform,
	homeDirectory: homedir(),
	pathExists: existsSync,
	findMacApplications,
	getIconDataUrl: getMacApplicationIconDataUrl,
};

export const discoverAvailableCodingAgents = async (
	context: CodingAgentDiscoveryContext,
): Promise<readonly InstalledCodingAgent[]> => {
	if (context.platform !== 'darwin') {
		return [];
	}

	const installedCodingAgents: Omit<InstalledCodingAgent, 'iconDataUrl'>[] = [];
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

	return Promise.all(
		installedCodingAgents.map(async (codingAgent) => ({
			...codingAgent,
			iconDataUrl: await context.getIconDataUrl(
				codingAgent.id,
				codingAgent.applicationPath,
			),
		})),
	);
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
}): {command: string; args: string[]} => {
	switch (codingAgent.id) {
		case 'codex':
			return {
				command: path.join(
					codingAgent.applicationPath,
					'Contents/Resources/codex',
				),
				args: ['app', projectPath],
			};
		case 'cursor':
			return {
				command: path.join(
					codingAgent.applicationPath,
					'Contents/Resources/app/bin/cursor',
				),
				args: ['--glass', '--suppress-popups-on-startup', projectPath],
			};
		case 'copilot':
		case 'claude-code':
			return {
				command: 'open',
				args: ['-a', codingAgent.applicationPath, projectPath],
			};
		default: {
			const invalidId: never = codingAgent.id;
			throw new Error(`Unknown coding agent: ${invalidId}`);
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
	const {command, args} = getCodingAgentLaunchCommand({
		codingAgent,
		projectPath,
	});

	return new Promise<boolean>((resolve) => {
		try {
			const child = spawn(command, args, {
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
