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

const apiHandlerContext = {
	binariesDirectory: null,
	entryPoint: '',
	getDefaultCodingAgent: () => null,
	getDefaultEditor: () => null,
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
