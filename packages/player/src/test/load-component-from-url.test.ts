import {expect, test} from 'bun:test';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import React from 'react';
import {
	experimental_loadComponentFromUrl,
	Player,
	PlayerInternals,
} from '../index.js';
import {render} from './test-utils.js';

const makeModuleUrl = (code: string) => {
	return `data:text/javascript;charset=utf-8,${encodeURIComponent(code)}`;
};

test('loadComponentFromUrl() should validate url', () => {
	expect(() => {
		PlayerInternals.loadComponentFromUrl({
			// @ts-expect-error
			url: undefined,
		});
	}).toThrow(/must be a non-empty string/);

	expect(() => {
		PlayerInternals.loadComponentFromUrl({
			url: '   ',
		});
	}).toThrow(/must be a non-empty string/);
});

test('loadComponentFromUrl() should validate exportName', () => {
	expect(() => {
		PlayerInternals.loadComponentFromUrl({
			url: makeModuleUrl('export default () => null;'),
			// @ts-expect-error
			exportName: 1,
		});
	}).toThrow(/must be a non-empty string/);

	expect(() => {
		PlayerInternals.loadComponentFromUrl({
			url: makeModuleUrl('export default () => null;'),
			exportName: '   ',
		});
	}).toThrow(/must be a non-empty string/);
});

test('loadComponentFromUrl() should load default export', async () => {
	const load = PlayerInternals.loadComponentFromUrl({
		url: makeModuleUrl(
			'const Component = () => null; export default Component;',
		),
	});

	const comp = await load();
	expect(typeof comp.default).toBe('function');
});

test('loadComponentFromUrl() should load named export', async () => {
	const load = PlayerInternals.loadComponentFromUrl({
		url: makeModuleUrl('export const Template = () => null;'),
		exportName: 'Template',
	});

	const comp = await load();
	expect(typeof comp.default).toBe('function');
});

test('loadComponentFromUrl() should throw if export does not exist', async () => {
	const load = PlayerInternals.loadComponentFromUrl({
		url: makeModuleUrl('export default () => null;'),
		exportName: 'Missing',
	});

	await expect(load()).rejects.toThrow(/Could not find export "Missing"/);
});

test('loadComponentFromUrl() should throw if export is not a component', async () => {
	const load = PlayerInternals.loadComponentFromUrl({
		url: makeModuleUrl('export const Meaning = 42;'),
		exportName: 'Meaning',
	});

	await expect(load()).rejects.toThrow(/is not a React component/);
});

test('loadComponentFromUrl() should render content inside <Player />', async () => {
	const remoteModuleUrl = pathToFileURL(
		path.join(process.cwd(), 'src/test/fixtures/remote-player-module.mjs'),
	).href;

	const lazyComponent = experimental_loadComponentFromUrl({
		url: remoteModuleUrl,
	});

	const {findByText} = render(
		React.createElement(Player, {
			lazyComponent,
			compositionWidth: 1280,
			compositionHeight: 720,
			fps: 30,
			durationInFrames: 30,
			acknowledgeRemotionLicense: true,
			inputProps: {
				label: 'it works',
			},
		}),
	);

	await findByText('Remote says: it works');
});
