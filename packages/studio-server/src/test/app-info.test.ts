import {expect, test} from 'bun:test';
import {getAppInfo} from '../helpers/app-discovery';

test('exposes only an opaque ID and name for an installed custom editor', async () => {
	const {editorInfo: response} = await getAppInfo({
		defaultCodingAgent: null,
		defaultEditor: {
			type: 'custom',
			name: 'Acme Editor',
			executable: process.execPath,
			arguments: ['--goto', '%TARGET_PATH%'],
		},
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
	const {editorInfo: response} = await getAppInfo({
		defaultCodingAgent: null,
		defaultEditor: {
			type: 'custom',
			name: 'Missing Editor',
			executable: '/missing/remotion-editor',
			arguments: ['%TARGET_PATH%'],
		},
	});

	expect(response.defaultEditor).toBe('custom');
	expect(response.installedEditors).not.toContainEqual(
		expect.objectContaining({id: 'custom'}),
	);
});
