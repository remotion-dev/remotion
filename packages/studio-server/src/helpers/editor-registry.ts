import {execFile} from 'node:child_process';
import {existsSync} from 'node:fs';
import {homedir} from 'node:os';
import path from 'node:path';
import {promisify} from 'node:util';
import type {BuiltInEditor} from '@remotion/renderer';
import {defaultEditorIds} from '@remotion/renderer';

const execFilePromise = promisify(execFile);

export type InstalledEditor = {
	id: BuiltInEditor;
	name: string;
	process: string;
	command: string;
};

type DarwinEditorVariant = {
	name: string;
	bundleIdentifiers: readonly string[];
	applicationNames: readonly string[];
	executable: string;
	command: string;
};

type ExecutableEditorVariant = {
	name: string;
	paths: (context: EditorDiscoveryContext) => readonly string[];
	commands: readonly string[];
};

type EditorDefinition = {
	darwin: readonly DarwinEditorVariant[];
	linux: readonly ExecutableEditorVariant[];
	win32: readonly ExecutableEditorVariant[];
};

export type EditorDiscoveryContext = {
	platform: NodeJS.Platform;
	env: NodeJS.ProcessEnv;
	homeDirectory: string;
	pathExists: (filePath: string) => boolean;
	findMacApplications: (bundleIdentifier: string) => Promise<readonly string[]>;
	findWindowsApplications: (
		editor: BuiltInEditor,
	) => Promise<readonly string[]>;
};

const getWindowsEnvironmentPaths = (
	context: EditorDiscoveryContext,
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

const editorDefinitions = {
	vscode: {
		darwin: [
			{
				name: 'VS Code',
				bundleIdentifiers: ['com.microsoft.VSCode'],
				applicationNames: ['Visual Studio Code.app'],
				executable: 'Contents/Resources/app/bin/code',
				command: 'code',
			},
			{
				name: 'VS Code Insiders',
				bundleIdentifiers: ['com.microsoft.VSCodeInsiders'],
				applicationNames: ['Visual Studio Code - Insiders.app'],
				executable: 'Contents/Resources/app/bin/code-insiders',
				command: 'code-insiders',
			},
		],
		linux: [
			{
				name: 'VS Code',
				paths: () => [
					'/usr/share/code/bin/code',
					'/snap/bin/code',
					'/usr/bin/code',
					'/var/lib/flatpak/exports/bin/com.visualstudio.code',
				],
				commands: ['code'],
			},
			{
				name: 'VS Code Insiders',
				paths: () => [
					'/snap/bin/code-insiders',
					'/usr/bin/code-insiders',
					'/var/lib/flatpak/exports/bin/com.visualstudio.code.insiders',
				],
				commands: ['code-insiders'],
			},
		],
		win32: [
			{
				name: 'VS Code',
				paths: (context) =>
					getWindowsEnvironmentPaths(context, [
						'Microsoft VS Code',
						'Code.exe',
					]),
				commands: ['Code.exe', 'code.cmd'],
			},
			{
				name: 'VS Code Insiders',
				paths: (context) =>
					getWindowsEnvironmentPaths(context, [
						'Microsoft VS Code Insiders',
						'Code - Insiders.exe',
					]),
				commands: ['Code - Insiders.exe', 'code-insiders.cmd'],
			},
		],
	},
	cursor: {
		darwin: [
			{
				name: 'Cursor',
				bundleIdentifiers: ['com.todesktop.230313mzl4w4u92'],
				applicationNames: ['Cursor.app'],
				executable: 'Contents/Resources/app/bin/cursor',
				command: 'cursor',
			},
		],
		linux: [
			{
				name: 'Cursor',
				paths: (context) => [
					'/usr/bin/cursor',
					'/usr/local/bin/cursor',
					path.posix.join(context.homeDirectory, '.local/bin/cursor'),
				],
				commands: ['cursor'],
			},
		],
		win32: [
			{
				name: 'Cursor',
				paths: (context) =>
					getWindowsEnvironmentPaths(context, ['cursor', 'Cursor.exe']),
				commands: ['Cursor.exe', 'cursor.cmd'],
			},
		],
	},
	windsurf: {
		darwin: [
			{
				name: 'Windsurf',
				bundleIdentifiers: ['com.exafunction.windsurf'],
				applicationNames: ['Windsurf.app'],
				executable: 'Contents/Resources/app/bin/windsurf',
				command: 'windsurf',
			},
		],
		linux: [
			{
				name: 'Windsurf',
				paths: (context) => [
					'/usr/bin/windsurf',
					'/usr/local/bin/windsurf',
					path.posix.join(context.homeDirectory, '.local/bin/windsurf'),
				],
				commands: ['windsurf'],
			},
		],
		win32: [
			{
				name: 'Windsurf',
				paths: (context) =>
					getWindowsEnvironmentPaths(context, ['Windsurf', 'Windsurf.exe']),
				commands: ['Windsurf.exe', 'windsurf.cmd'],
			},
		],
	},
	zed: {
		darwin: [
			{
				name: 'Zed',
				bundleIdentifiers: ['dev.zed.Zed'],
				applicationNames: ['Zed.app'],
				executable: 'Contents/MacOS/cli',
				command: 'zed',
			},
			{
				name: 'Zed Preview',
				bundleIdentifiers: ['dev.zed.Zed-Preview'],
				applicationNames: ['Zed Preview.app'],
				executable: 'Contents/MacOS/cli',
				command: 'zed',
			},
		],
		linux: [
			{
				name: 'Zed',
				paths: (context) => [
					'/usr/bin/zedit',
					'/usr/bin/zeditor',
					'/usr/bin/zed-editor',
					'/usr/bin/zed',
					path.posix.join(context.homeDirectory, '.local/bin/zed'),
				],
				commands: ['zed', 'zedit', 'zeditor', 'zed-editor'],
			},
		],
		win32: [
			{
				name: 'Zed',
				paths: (context) =>
					getWindowsEnvironmentPaths(context, ['Zed', 'Zed.exe']),
				commands: ['Zed.exe'],
			},
		],
	},
	vscodium: {
		darwin: [
			{
				name: 'VSCodium',
				bundleIdentifiers: ['com.vscodium', 'com.visualstudio.code.oss'],
				applicationNames: ['VSCodium.app'],
				executable: 'Contents/Resources/app/bin/codium',
				command: 'vscodium',
			},
		],
		linux: [
			{
				name: 'VSCodium',
				paths: (context) => [
					'/usr/bin/codium',
					'/usr/share/vscodium-bin/bin/codium',
					'/snap/bin/codium',
					'/var/lib/flatpak/exports/bin/com.vscodium.codium',
					path.posix.join(
						context.homeDirectory,
						'.local/share/flatpak/exports/bin/com.vscodium.codium',
					),
				],
				commands: ['codium', 'vscodium'],
			},
		],
		win32: [
			{
				name: 'VSCodium',
				paths: (context) =>
					getWindowsEnvironmentPaths(context, ['VSCodium', 'VSCodium.exe']),
				commands: ['VSCodium.exe', 'codium.cmd'],
			},
		],
	},
	webstorm: {
		darwin: [
			{
				name: 'WebStorm',
				bundleIdentifiers: ['com.jetbrains.WebStorm'],
				applicationNames: ['WebStorm.app'],
				executable: 'Contents/MacOS/webstorm',
				command: 'webstorm',
			},
		],
		linux: [
			{
				name: 'WebStorm',
				paths: (context) => [
					'/snap/bin/webstorm',
					path.posix.join(
						context.homeDirectory,
						'.local/share/JetBrains/Toolbox/scripts/webstorm',
					),
				],
				commands: ['webstorm'],
			},
		],
		win32: [
			{
				name: 'WebStorm',
				paths: (context) => {
					const localAppData = context.env.LOCALAPPDATA;
					return localAppData
						? [
								path.win32.join(
									localAppData,
									'JetBrains/Toolbox/scripts/webstorm.cmd',
								),
							]
						: [];
				},
				commands: ['webstorm64.exe', 'webstorm.exe', 'webstorm.cmd'],
			},
		],
	},
	'sublime-text': {
		darwin: [
			{
				name: 'Sublime Text',
				bundleIdentifiers: [
					'com.sublimetext.4',
					'com.sublimetext.3',
					'com.sublimetext.2',
				],
				applicationNames: [
					'Sublime Text.app',
					'Sublime Text Dev.app',
					'Sublime Text 2.app',
				],
				executable: 'Contents/SharedSupport/bin/subl',
				command: 'subl',
			},
		],
		linux: [
			{
				name: 'Sublime Text',
				paths: () => ['/usr/bin/subl', '/snap/bin/subl'],
				commands: ['subl'],
			},
		],
		win32: [
			{
				name: 'Sublime Text',
				paths: (context) => [
					...getWindowsEnvironmentPaths(context, [
						'Sublime Text',
						'sublime_text.exe',
					]),
					...getWindowsEnvironmentPaths(context, [
						'Sublime Text 3',
						'sublime_text.exe',
					]),
				],
				commands: ['subl.exe', 'sublime_text.exe'],
			},
		],
	},
} satisfies Record<BuiltInEditor, EditorDefinition>;

export const getDefaultEditorName = (id: BuiltInEditor) =>
	editorDefinitions[id].darwin[0].name;

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

type WindowsRegistryApplication = {
	displayName: string;
	displayIcon: string;
};

const windowsDisplayNamePrefixes = {
	vscode: ['Microsoft Visual Studio Code'],
	cursor: ['Cursor'],
	windsurf: ['Windsurf'],
	zed: ['Zed'],
	vscodium: ['VSCodium'],
	webstorm: ['WebStorm', 'JetBrains WebStorm'],
	'sublime-text': ['Sublime Text'],
} satisfies Record<BuiltInEditor, readonly string[]>;

const parseWindowsRegistryApplications = (
	output: string,
): readonly WindowsRegistryApplication[] => {
	const applications: WindowsRegistryApplication[] = [];
	let displayName = '';
	let displayIcon = '';

	const flush = () => {
		if (displayName && displayIcon) {
			applications.push({displayIcon, displayName});
		}

		displayName = '';
		displayIcon = '';
	};

	for (const line of output.split(/\r?\n/)) {
		if (line.startsWith('HKEY_')) {
			flush();
			continue;
		}

		const match = /^\s+(DisplayName|DisplayIcon)\s+REG_\w+\s+(.*)$/.exec(line);
		if (!match) {
			continue;
		}

		if (match[1] === 'DisplayName') {
			displayName = match[2].trim();
		} else {
			displayIcon = match[2].trim();
		}
	}

	flush();
	return applications;
};

const cleanWindowsDisplayIcon = (displayIcon: string) => {
	const quotedPath = /^"([^"]+)"/.exec(displayIcon);
	if (quotedPath) {
		return quotedPath[1];
	}

	return displayIcon.replace(/,\d+$/, '').trim();
};

let windowsRegistryApplications: Promise<
	readonly WindowsRegistryApplication[]
> | null = null;

const getWindowsRegistryApplications = () => {
	windowsRegistryApplications ??= Promise.all(
		[
			'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall',
			'HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall',
			'HKLM\\Software\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall',
		].map(async (registryKey) => {
			try {
				const {stdout} = await execFilePromise('reg.exe', [
					'query',
					registryKey,
					'/s',
				]);
				return parseWindowsRegistryApplications(stdout);
			} catch {
				return [];
			}
		}),
	).then((results) => results.flat());
	return windowsRegistryApplications;
};

const findWindowsApplications = async (editor: BuiltInEditor) => {
	const prefixes = windowsDisplayNamePrefixes[editor];
	const applications = await getWindowsRegistryApplications();
	return applications
		.filter(({displayName}) =>
			prefixes.some((prefix) => displayName.startsWith(prefix)),
		)
		.map(({displayIcon}) => cleanWindowsDisplayIcon(displayIcon));
};

const defaultDiscoveryContext: EditorDiscoveryContext = {
	platform: process.platform,
	env: process.env,
	homeDirectory: homedir(),
	pathExists: existsSync,
	findMacApplications,
	findWindowsApplications,
};

const unique = (values: readonly string[]) => [...new Set(values)];

const findDarwinEditor = async ({
	id,
	variants,
	context,
}: {
	id: BuiltInEditor;
	variants: readonly DarwinEditorVariant[];
	context: EditorDiscoveryContext;
}): Promise<InstalledEditor | null> => {
	for (const variant of variants) {
		const discoveredApplications = (
			await Promise.all(
				variant.bundleIdentifiers.map((bundleIdentifier) =>
					context.findMacApplications(bundleIdentifier),
				),
			)
		).flat();
		const knownApplications = variant.applicationNames.flatMap((name) => [
			path.join('/Applications', name),
			path.join(context.homeDirectory, 'Applications', name),
		]);

		for (const applicationPath of unique([
			...discoveredApplications,
			...knownApplications,
		])) {
			const executablePath = path.join(applicationPath, variant.executable);
			if (
				context.pathExists(applicationPath) &&
				context.pathExists(executablePath)
			) {
				return {
					id,
					name: variant.name,
					process: executablePath,
					command: variant.command,
				};
			}
		}
	}

	return null;
};

const getPathDirectories = (context: EditorDiscoveryContext) => {
	const value = context.env.PATH ?? context.env.Path ?? '';
	return value.split(context.platform === 'win32' ? ';' : ':').filter(Boolean);
};

const findExecutable = ({
	variant,
	context,
}: {
	variant: ExecutableEditorVariant;
	context: EditorDiscoveryContext;
}) => {
	for (const executablePath of variant.paths(context)) {
		if (context.pathExists(executablePath)) {
			return executablePath;
		}
	}

	const pathImplementation =
		context.platform === 'win32' ? path.win32 : path.posix;
	for (const directory of getPathDirectories(context)) {
		for (const command of variant.commands) {
			const executablePath = pathImplementation.join(directory, command);
			if (context.pathExists(executablePath)) {
				return executablePath;
			}
		}
	}

	return null;
};

const findExecutableEditor = ({
	id,
	variants,
	context,
	additionalPaths,
}: {
	id: BuiltInEditor;
	variants: readonly ExecutableEditorVariant[];
	context: EditorDiscoveryContext;
	additionalPaths: readonly string[];
}): InstalledEditor | null => {
	for (const executablePath of additionalPaths) {
		if (context.pathExists(executablePath)) {
			return {
				id,
				name: variants[0].name,
				process: executablePath,
				command: executablePath,
			};
		}
	}

	for (const variant of variants) {
		const executablePath = findExecutable({variant, context});
		if (executablePath) {
			return {
				id,
				name: variant.name,
				process: executablePath,
				command: executablePath,
			};
		}
	}

	return null;
};

export const discoverAvailableEditors = async (
	context: EditorDiscoveryContext,
): Promise<readonly InstalledEditor[]> => {
	if (
		context.platform !== 'darwin' &&
		context.platform !== 'linux' &&
		context.platform !== 'win32'
	) {
		return [];
	}

	const results: InstalledEditor[] = [];
	for (const id of defaultEditorIds) {
		const definition = editorDefinitions[id];
		const windowsApplications =
			context.platform === 'win32'
				? await context.findWindowsApplications(id)
				: [];
		const editor =
			context.platform === 'darwin'
				? await findDarwinEditor({
						id,
						variants: definition.darwin,
						context,
					})
				: findExecutableEditor({
						id,
						variants:
							context.platform === 'win32'
								? definition.win32
								: definition.linux,
						context,
						additionalPaths: windowsApplications,
					});

		if (editor) {
			results.push(editor);
		}
	}

	return results;
};

let availableEditors: Promise<readonly InstalledEditor[]> | null = null;

export const getAvailableEditors = () => {
	availableEditors ??= discoverAvailableEditors(defaultDiscoveryContext);
	return availableEditors;
};
