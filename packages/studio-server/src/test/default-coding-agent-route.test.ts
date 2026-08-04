import {expect, test} from 'bun:test';
import {mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {
	createFileWatcherRegistry,
	setFileWatcherRegistry,
} from '../file-watcher';
import {updateDefaultCodingAgentHandler} from '../preview-server/routes/default-coding-agent';

test('persists the selected coding agent through the route', async () => {
	const directory = mkdtempSync(join(tmpdir(), 'remotion-coding-agent-'));
	const configFile = join(directory, 'remotion.config.ts');
	const cleanupFileWatcher = setFileWatcherRegistry(
		createFileWatcherRegistry(),
	);
	writeFileSync(
		configFile,
		[
			"import {Config} from '@remotion/cli/config';",
			"Config.setDefaultCodingAgent('cursor');",
			'Config.setOverwriteOutput(true);',
			'',
		].join('\n'),
	);

	try {
		const response = await updateDefaultCodingAgentHandler({
			binariesDirectory: null,
			configFile,
			entryPoint: '',
			getDefaultCodingAgent: () => 'cursor',
			getDefaultEditor: () => null,
			input: {defaultCodingAgent: 'codex'},
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
				"Config.setDefaultCodingAgent('codex');",
				'',
			].join('\n'),
		);
	} finally {
		cleanupFileWatcher();
		rmSync(directory, {force: true, recursive: true});
	}
});
