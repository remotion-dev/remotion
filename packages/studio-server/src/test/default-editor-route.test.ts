import {expect, test} from 'bun:test';
import {mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {
	createFileWatcherRegistry,
	setFileWatcherRegistry,
} from '../file-watcher';
import {
	updateDefaultEditorHandler,
	updateDefaultEditorInConfig,
} from '../preview-server/routes/default-editor';

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
