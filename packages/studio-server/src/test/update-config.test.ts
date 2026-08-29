import {expect, test} from 'bun:test';
import {mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {
	createFileWatcherRegistry,
	setFileWatcherRegistry,
	type FileChangeEvent,
} from '../file-watcher';
import {
	updateConfigFile,
	updateConfigHandler,
} from '../preview-server/routes/update-config';

const studioRuntimeConfig = (elementLibraryUrls: readonly string[]) => ({
	askAIEnabled: false,
	bufferStateDelayInMilliseconds: null,
	configFileStudioSettings: null,
	defaultCodingAgent: null,
	defaultEditor: null,
	elementLibraries: elementLibraryUrls.map((url) => ({
		displayName: null,
		url,
	})),
	interactivityEnabled: true,
	keyboardShortcutsEnabled: true,
	maxTimelineTracks: null,
	publicLicenseKey: null,
});

const apiHandlerContext = {
	binariesDirectory: null,
	entryPoint: '',
	getDefaultCodingAgent: () => null,
	getDefaultEditor: () => null,
	getStudioRuntimeConfig: () => studioRuntimeConfig([]),
	logLevel: 'error' as const,
	methods: {
		addJob: () => undefined,
		cancelJob: () => undefined,
		removeJob: () => undefined,
	},
	publicDir: '',
	request: {} as never,
	response: {} as never,
};

test('updates multiple config settings in one rewrite', () => {
	expect(
		updateConfigFile({
			existingElementLibraryUrls: [],
			configContents: [
				"import {Config} from '@remotion/cli/config';",
				"Config.setDefaultEditor('vscode');",
				'Config.setDefaultEditor(',
				"'zed',",
				');',
				"Config.setDefaultCodingAgent('cursor');",
				'Config.setOverwriteOutput(true);',
				"// Config.setDefaultEditor('commented');",
				'const example = "Config.setDefaultCodingAgent(\'example\');";',
				'',
			].join('\n'),
			updates: [
				{
					setter: 'setDefaultEditor',
					type: 'set',
					value: 'cursor',
				},
				{setter: 'setDefaultCodingAgent', type: 'delete'},
			],
		}),
	).toBe(
		[
			"import {Config} from '@remotion/cli/config';",
			'Config.setOverwriteOutput(true);',
			"// Config.setDefaultEditor('commented');",
			'const example = "Config.setDefaultCodingAgent(\'example\');";',
			"Config.setDefaultEditor('cursor');",
			'',
		].join('\n'),
	);
});

test('writes JSON-compatible config values safely', () => {
	expect(
		updateConfigFile({
			existingElementLibraryUrls: [],
			configContents: "import {Config} from '@remotion/cli/config';",
			updates: [
				{
					setter: 'setMetadata',
					type: 'set',
					value: {author: "O'Reilly", tags: ['one', 'two']},
				},
			],
		}),
	).toBe(
		[
			"import {Config} from '@remotion/cli/config';",
			'Config.setMetadata({',
			"    'author': 'O\\'Reilly',",
			"    'tags': ['one', 'two']",
			'});',
			'',
		].join('\n'),
	);
});

test('escapes line separators before writing a config value', () => {
	expect(
		updateConfigFile({
			existingElementLibraryUrls: [],
			configContents: "import {Config} from '@remotion/cli/config';",
			updates: [
				{
					setter: 'setPublicPath',
					type: 'set',
					value: "quote' slash\\ cr\r lf\n ls\u2028 ps\u2029",
				},
			],
		}),
	).toBe(
		[
			"import {Config} from '@remotion/cli/config';",
			"Config.setPublicPath('quote\\' slash\\\\ cr\\r lf\\n ls\\u2028 ps\\u2029');",
			'',
		].join('\n'),
	);
});

test('adds Element catalogs without replacing or duplicating existing calls', () => {
	const configContents = [
		"import {Config} from '@remotion/cli/config';",
		'// Keep this catalog and comment.',
		"Config.addElementLibrary({url: 'https://existing.example.com/'});",
		'Config.setOverwriteOutput(true);',
		'',
	].join('\n');
	const updated = updateConfigFile({
		configContents,
		existingElementLibraryUrls: [],
		updates: [
			{
				setter: 'addElementLibrary',
				type: 'set',
				value: {
					url: 'https://new.example.com/catalog',
					displayName: " O'Reilly \\ Catalog\u2028Name ",
				},
			},
		],
	});

	expect(updated).toContain('// Keep this catalog and comment.');
	expect(updated).toContain(
		"Config.addElementLibrary({url: 'https://existing.example.com/'});",
	);
	expect(updated).toContain('Config.setOverwriteOutput(true);');
	expect(updated).toContain("'url': 'https://new.example.com/catalog'");
	expect(updated).toContain(
		"'displayName': 'O\\'Reilly \\\\ Catalog\\u2028Name'",
	);

	const repeated = updateConfigFile({
		configContents: updated,
		existingElementLibraryUrls: [],
		updates: [
			{
				setter: 'addElementLibrary',
				type: 'set',
				value: {url: 'https://new.example.com/catalog'},
			},
		],
	});
	expect(repeated).toBe(updated);
	expect(repeated.match(/Config\.addElementLibrary/g)).toHaveLength(2);

	expect(
		updateConfigFile({
			configContents,
			existingElementLibraryUrls: [],
			updates: [
				{
					setter: 'addElementLibrary',
					type: 'set',
					value: {url: 'https://existing.example.com'},
				},
			],
		}),
	).toBe(configContents);
});

test('uses runtime catalogs for dynamic config deduplication and skips no-op writes', async () => {
	const directory = mkdtempSync(join(tmpdir(), 'remotion-config-update-'));
	const configFile = join(directory, 'remotion.config.ts');
	const configContents = [
		"import {Config} from '@remotion/cli/config';",
		"const existing = {url: 'https://dynamic.example.com/'};",
		'Config.addElementLibrary(existing);',
		'',
	].join('\n');
	writeFileSync(configFile, configContents);
	const fileWatcherRegistry = createFileWatcherRegistry();
	const cleanupFileWatcher = setFileWatcherRegistry(fileWatcherRegistry);
	let configChangeEvent: FileChangeEvent | null = null;
	const {unwatch} = fileWatcherRegistry.installFileWatcher({
		existenceOnly: false,
		file: configFile,
		onChange: (event) => {
			configChangeEvent = event;
		},
	});

	try {
		const duplicateResponse = await updateConfigHandler({
			...apiHandlerContext,
			configFile,
			getStudioRuntimeConfig: () =>
				studioRuntimeConfig(['https://dynamic.example.com/']),
			input: {
				clientId: 'settings-client',
				updates: [
					{
						setter: 'addElementLibrary',
						type: 'set',
						value: {url: 'https://dynamic.example.com'},
					},
				],
			},
			remotionRoot: directory,
		});
		expect(duplicateResponse).toEqual({success: true});
		expect(readFileSync(configFile, 'utf8')).toBe(configContents);
		expect(configChangeEvent).toBe(null);

		const additionResponse = await updateConfigHandler({
			...apiHandlerContext,
			configFile,
			input: {
				clientId: 'settings-client',
				updates: [
					{
						setter: 'addElementLibrary',
						type: 'set',
						value: {
							url: 'https://new.example.com',
							displayName: ' New catalog ',
						},
					},
				],
			},
			remotionRoot: directory,
		});
		expect(additionResponse).toEqual({success: true});
		const addedContents = readFileSync(configFile, 'utf8');
		expect(addedContents).toContain("'url': 'https://new.example.com/'");
		expect(addedContents).toContain("'displayName': 'New catalog'");
		expect(configChangeEvent).toMatchObject({
			originatorClientId: 'settings-client',
			type: 'changed',
		});

		configChangeEvent = null;
		const repeatedResponse = await updateConfigHandler({
			...apiHandlerContext,
			configFile,
			input: {
				clientId: 'settings-client',
				updates: [
					{
						setter: 'addElementLibrary',
						type: 'set',
						value: {url: 'https://new.example.com'},
					},
				],
			},
			remotionRoot: directory,
		});
		expect(repeatedResponse).toEqual({success: true});
		expect(readFileSync(configFile, 'utf8')).toBe(addedContents);
		expect(configChangeEvent).toBe(null);
	} finally {
		unwatch();
		cleanupFileWatcher();
		rmSync(directory, {force: true, recursive: true});
	}
});

test('persists an arbitrary valid config setter through the route', async () => {
	const directory = mkdtempSync(join(tmpdir(), 'remotion-config-update-'));
	const configFile = join(directory, 'remotion.config.ts');
	const fileWatcherRegistry = createFileWatcherRegistry();
	const cleanupFileWatcher = setFileWatcherRegistry(fileWatcherRegistry);
	let configChangeEvent: FileChangeEvent | null = null;
	const {unwatch} = fileWatcherRegistry.installFileWatcher({
		existenceOnly: false,
		file: configFile,
		onChange: (event) => {
			configChangeEvent = event;
		},
	});
	writeFileSync(
		configFile,
		[
			"import {Config} from '@remotion/cli/config';",
			'Config.setOverwriteOutput(false);',
			'',
		].join('\n'),
	);

	try {
		const response = await updateConfigHandler({
			...apiHandlerContext,
			configFile,
			input: {
				clientId: 'settings-client',
				updates: [{setter: 'setOverwriteOutput', type: 'set', value: true}],
			},
			remotionRoot: directory,
		});

		expect(response).toEqual({success: true});
		expect(readFileSync(configFile, 'utf8')).toBe(
			[
				"import {Config} from '@remotion/cli/config';",
				'Config.setOverwriteOutput(true);',
				'',
			].join('\n'),
		);
		expect(configChangeEvent as FileChangeEvent | null).toEqual({
			content: [
				"import {Config} from '@remotion/cli/config';",
				'Config.setOverwriteOutput(true);',
				'',
			].join('\n'),
			originatorClientId: 'settings-client',
			type: 'changed',
			skipSequencePropsUpdate: false,
		});
	} finally {
		unwatch();
		cleanupFileWatcher();
		rmSync(directory, {force: true, recursive: true});
	}
});

test('rejects invalid updates without changing the config', async () => {
	const directory = mkdtempSync(join(tmpdir(), 'remotion-config-update-'));
	const configFile = join(directory, 'remotion.config.ts');
	const configContents = "import {Config} from '@remotion/cli/config';\n";
	writeFileSync(configFile, configContents);

	try {
		for (const updates of [
			[
				{
					setter: 'setNotARealOption',
					type: 'set' as const,
					value: true,
				},
			],
			[
				{
					setter: 'constructor.constructor',
					type: 'set' as const,
					value: 'unsafe',
				},
			],
			[
				{
					setter: 'setDefaultCodingAgent',
					type: 'set' as const,
					value: 'unknown-agent',
				},
			],
			[
				{
					setter: 'setPublicLicenseKey',
					type: 'set' as const,
					value: 'private-key',
				},
			],
			[
				{
					setter: 'addElementLibrary',
					type: 'set' as const,
					value: {url: 'file:///tmp/catalog'},
				},
			],
			[
				{
					setter: 'addElementLibrary',
					type: 'set' as const,
					value: {
						url: 'https://catalog.example.com',
						displayName: '  ',
					},
				},
			],
		]) {
			const response = await updateConfigHandler({
				...apiHandlerContext,
				configFile,
				input: {clientId: 'settings-client', updates},
				remotionRoot: directory,
			});

			expect(response.success).toBe(false);
		}

		expect(readFileSync(configFile, 'utf8')).toBe(configContents);
	} finally {
		rmSync(directory, {force: true, recursive: true});
	}
});
