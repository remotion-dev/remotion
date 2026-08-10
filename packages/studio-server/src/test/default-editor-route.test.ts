import {expect, test} from 'bun:test';
import {getDefaultEditorInfoHandler} from '../preview-server/routes/default-editor';

test('exposes only an opaque ID and name for a configured custom editor', async () => {
	const response = await getDefaultEditorInfoHandler({
		binariesDirectory: null,
		configFile: null,
		entryPoint: '',
		getDefaultCodingAgent: () => null,
		getDefaultEditor: () => ({
			type: 'custom',
			name: 'Acme Editor',
			executable: '/private/acme/editor',
			arguments: ['--goto', '%TARGET_PATH%'],
		}),
		getDefaultTerminal: () => null,
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

	expect(response.defaultEditor).toBe('custom');
	expect(response.installedEditors).toContainEqual({
		id: 'custom',
		name: 'Acme Editor',
		nameWithType: 'Acme Editor',
	});
	expect(JSON.stringify(response)).not.toContain('/private/acme/editor');
	expect(JSON.stringify(response)).not.toContain('%TARGET_PATH%');
});
