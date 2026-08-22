import {expect, test} from 'bun:test';
import type {DefaultEditor} from '@remotion/renderer';
import {getDefaultEditorInfoHandler} from '../preview-server/routes/default-editor';

const getEditorInfo = (defaultEditor: DefaultEditor | null) => {
	return getDefaultEditorInfoHandler({
		binariesDirectory: null,
		configFile: null,
		entryPoint: '',
		getDefaultCodingAgent: () => null,
		getDefaultEditor: () => defaultEditor,
		input: {},
		logLevel: 'error',
		methods: {
			addJob: () => undefined,
			cancelJob: () => undefined,
			removeJob: () => undefined,
		},
		publicDir: '',
		remotionRoot: '',
		request: {} as never,
		response: {} as never,
	});
};

test('exposes only an opaque ID and name for an installed custom editor', async () => {
	const response = await getEditorInfo({
		type: 'custom',
		name: 'Acme Editor',
		executable: process.execPath,
		arguments: ['--goto', '%TARGET_PATH%'],
	});

	expect(response.defaultEditor).toBe('custom');
	expect(response.installedEditors).toContainEqual({
		id: 'custom',
		name: 'Acme Editor',
		nameWithType: 'Acme Editor',
	});
	expect(JSON.stringify(response)).not.toContain(process.execPath);
	expect(JSON.stringify(response)).not.toContain('%TARGET_PATH%');
});

test('does not expose a custom editor whose executable is unavailable', async () => {
	const response = await getEditorInfo({
		type: 'custom',
		name: 'Missing Editor',
		executable: '/missing/remotion-editor',
		arguments: ['%TARGET_PATH%'],
	});

	expect(response.defaultEditor).toBe('custom');
	expect(response.installedEditors).not.toContainEqual(
		expect.objectContaining({id: 'custom'}),
	);
});
