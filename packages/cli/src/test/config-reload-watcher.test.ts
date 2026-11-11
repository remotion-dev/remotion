import {afterEach, expect, test} from 'bun:test';
import {mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {StudioServerInternals} from '@remotion/studio-server';
import {watchConfigFileForReloads} from '../config-reload';

const cleanups: (() => void)[] = [];

afterEach(() => {
	for (const cleanup of cleanups.splice(0)) {
		cleanup();
	}
});

const waitFor = async (predicate: () => boolean) => {
	const started = Date.now();
	while (!predicate()) {
		if (Date.now() - started > 2000) {
			throw new Error('Timed out waiting for condition');
		}

		await new Promise((resolve) => setTimeout(resolve, 20));
	}
};

test('a config change saved while a reload is running is reloaded afterwards', async () => {
	const directory = mkdtempSync(path.join(tmpdir(), 'remotion-config-'));
	const configFile = path.join(directory, 'remotion.config.js');
	writeFileSync(configFile, '');
	cleanups.push(() => rmSync(directory, {recursive: true}));
	cleanups.push(
		StudioServerInternals.setFileWatcherRegistry(
			StudioServerInternals.createFileWatcherRegistry(),
		),
	);

	const reloadedContents: string[] = [];
	let finishFirstReload: () => void = () => undefined;
	const {unwatch} = watchConfigFileForReloads({
		configFile,
		reload: () => {
			reloadedContents.push(readFileSync(configFile, 'utf-8'));
			if (reloadedContents.length > 1) {
				return Promise.resolve();
			}

			return new Promise<void>((resolve) => {
				finishFirstReload = resolve;
			});
		},
	});
	cleanups.push(unwatch);
	await new Promise((resolve) => setTimeout(resolve, 300));

	writeFileSync(configFile, 'Config.setStudioPort(3002);');
	await waitFor(() => reloadedContents.length === 1);

	writeFileSync(configFile, 'Config.setStudioPort(3003);');
	await new Promise((resolve) => setTimeout(resolve, 500));
	finishFirstReload();

	await waitFor(() => reloadedContents.length === 2).catch(() => undefined);
	expect(reloadedContents).toEqual([
		'Config.setStudioPort(3002);',
		'Config.setStudioPort(3003);',
	]);
});
