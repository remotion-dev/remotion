import {expect, test} from 'bun:test';
import {mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {
	createFileWatcherRegistry,
	setFileWatcherRegistry,
} from '../file-watcher';
import {
	getDefaultEditorInfoHandler,
	updateDefaultEditorHandler,
	updateDefaultEditorInConfig,
} from '../preview-server/routes/default-editor';

const apiHandlerContext = {
	binariesDirectory: null,
	configFile: null,
	entryPoint: '',
	logLevel: 'error' as const,
	methods: {
		addJob: () => undefined,
		cancelJob: () => undefined,
		removeJob: () => undefined,
	},
	publicDir: '',
	remotionRoot: '',
	request: {} as never,
	response: {} as never,
};

test('appends the default editor to the config on a new line', () => {
	expect(
		updateDefaultEditorInConfig({
			configContents: "import {Config} from '@remotion/cli/config';\n",
			defaultEditor: 'cursor',
		}),
	).toBe(
		"import {Config} from '@remotion/cli/config';\nConfig.setDefaultEditor('cursor');\n",
	);
});

test('replaces all existing default editor calls', () => {
	expect(
		updateDefaultEditorInConfig({
			configContents: [
				"import {Config} from '@remotion/cli/config';",
				"Config.setDefaultEditor('vscode');",
				'Config.setDefaultEditor(',
				"\t'zed',",
				');',
				'Config.setOverwriteOutput(true);',
				'',
			].join('\n'),
			defaultEditor: 'cursor',
		}),
	).toBe(
		[
			"import {Config} from '@remotion/cli/config';",
			'Config.setOverwriteOutput(true);',
			"Config.setDefaultEditor('cursor');",
			'',
		].join('\n'),
	);
});

test('preserves commented and string references to the setter', () => {
	expect(
		updateDefaultEditorInConfig({
			configContents: [
				"import {Config} from '@remotion/cli/config';",
				"// Config.setDefaultEditor('vscode');",
				'const example = "Config.setDefaultEditor(\'zed\');";',
				'',
			].join('\n'),
			defaultEditor: 'cursor',
		}),
	).toBe(
		[
			"import {Config} from '@remotion/cli/config';",
			"// Config.setDefaultEditor('vscode');",
			'const example = "Config.setDefaultEditor(\'zed\');";',
			"Config.setDefaultEditor('cursor');",
			'',
		].join('\n'),
	);
});

test('exposes only an opaque ID and name for a configured custom editor', async () => {
	const response = await getDefaultEditorInfoHandler({
		...apiHandlerContext,
		getDefaultCodingAgent: () => null,
		getDefaultEditor: () => ({
			type: 'custom',
			name: 'Acme Editor',
			executable: '/private/acme/editor',
			arguments: ['--goto', '%TARGET_PATH%'],
		}),
		input: {},
	});

	expect(response.defaultEditor).toBe('custom');
	expect(response.installedEditors).toContainEqual({
		id: 'custom',
		name: 'Acme Editor',
	});
	expect(JSON.stringify(response)).not.toContain('/private/acme/editor');
	expect(JSON.stringify(response)).not.toContain('%TARGET_PATH%');
});

test('keeps the server-side custom editor definition when Studio selects it', async () => {
	const directory = mkdtempSync(join(tmpdir(), 'remotion-default-editor-'));
	const configFile = join(directory, 'remotion.config.ts');
	const configContents = [
		"import {Config} from '@remotion/cli/config';",
		'Config.setDefaultEditor({',
		"\ttype: 'custom',",
		"\tname: 'Acme Editor',",
		'\texecutable: process.env.REMOTION_EDITOR_PATH!,',
		"\targuments: ['%TARGET_PATH%'],",
		'});',
		'',
	].join('\n');
	writeFileSync(configFile, configContents);

	try {
		const response = await updateDefaultEditorHandler({
			...apiHandlerContext,
			configFile,
			getDefaultCodingAgent: () => null,
			getDefaultEditor: () => ({
				type: 'custom',
				name: 'Acme Editor',
				executable: '/resolved/acme/editor',
				arguments: ['%TARGET_PATH%'],
			}),
			input: {defaultEditor: 'custom'},
		});

		expect(response).toEqual({success: true});
		expect(readFileSync(configFile, 'utf8')).toBe(configContents);
	} finally {
		rmSync(directory, {force: true, recursive: true});
	}
});

test('rejects custom editor definitions sent by the browser', async () => {
	const directory = mkdtempSync(join(tmpdir(), 'remotion-default-editor-'));
	const configFile = join(directory, 'remotion.config.ts');
	writeFileSync(configFile, "import {Config} from '@remotion/cli/config';\n");

	try {
		const response = await updateDefaultEditorHandler({
			...apiHandlerContext,
			configFile,
			getDefaultCodingAgent: () => null,
			getDefaultEditor: () => null,
			input: {
				defaultEditor: {
					type: 'custom',
					executable: '/tmp/untrusted',
					arguments: ['%TARGET_PATH%'],
				} as never,
			},
		});

		expect(response.success).toBe(false);
		expect(readFileSync(configFile, 'utf8')).toBe(
			"import {Config} from '@remotion/cli/config';\n",
		);
	} finally {
		rmSync(directory, {force: true, recursive: true});
	}
});

test('removes the configured editor when selecting no preference', async () => {
	const directory = mkdtempSync(join(tmpdir(), 'remotion-default-editor-'));
	const configFile = join(directory, 'remotion.config.ts');
	const cleanupFileWatcher = setFileWatcherRegistry(
		createFileWatcherRegistry(),
	);

	try {
		writeFileSync(
			configFile,
			[
				"import {Config} from '@remotion/cli/config';",
				"Config.setDefaultEditor('vscode');",
				'Config.setOverwriteOutput(true);',
				'',
			].join('\n'),
		);

		const response = await updateDefaultEditorHandler({
			binariesDirectory: null,
			configFile,
			entryPoint: '',
			getDefaultCodingAgent: () => null,
			getDefaultEditor: () => 'vscode',
			input: {defaultEditor: null},
			logLevel: 'error',
			methods: {
				addJob: () => undefined,
				cancelJob: () => undefined,
				removeJob: () => undefined,
			},
			publicDir: '',
			remotionRoot: directory,
			request: {} as never,
			response: {} as never,
		});

		expect(response).toEqual({success: true});
		expect(readFileSync(configFile, 'utf8')).toBe(
			[
				"import {Config} from '@remotion/cli/config';",
				'Config.setOverwriteOutput(true);',
				'',
			].join('\n'),
		);
	} finally {
		cleanupFileWatcher();
		rmSync(directory, {force: true, recursive: true});
	}
});
