import {afterEach, describe, expect, test} from 'bun:test';
import {mkdtemp, readFile, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {readState, reviewKey, updateState} from '../state';

const directories: string[] = [];

const temporaryStatePath = async () => {
	const directory = await mkdtemp(join(tmpdir(), 'pullfrog-state-test-'));
	directories.push(directory);
	return join(directory, 'state.json');
};

afterEach(async () => {
	await Promise.all(
		directories
			.splice(0)
			.map((directory) => rm(directory, {recursive: true, force: true})),
	);
});

describe('Pullfrog monitor state', () => {
	test('creates a default state when the file is missing', async () => {
		const path = await temporaryStatePath();
		const state = await readState(path);
		expect(state.version).toBe(3);
		expect(state.reviews).toEqual({});
	});

	test('serializes concurrent read-modify-write transactions', async () => {
		const path = await temporaryStatePath();
		await Promise.all(
			Array.from({length: 10}, (_, index) =>
				updateState(path, async (state) => {
					await Bun.sleep(2);
					state.reviews[`owner/repo#${index}`] = {
						repository: 'owner/repo',
						prNumber: index,
						prUrl: `https://github.com/owner/repo/pull/${index}`,
						title: `PR ${index}`,
						headSha: String(index),
						monitoring: true,
						monitorMessage: null,
						currentFingerprint: null,
						readyFingerprint: null,
						reviewedFingerprint: null,
						reviewOutcome: null,
						status: 'watching',
						detectedAt: null,
						reviewedAt: null,
						reviewStartedAt: null,
						activeAttemptId: null,
						activeAttemptPid: null,
						notifiedAt: null,
						error: null,
					};
				}),
			),
		);
		const state = await readState(path);
		expect(Object.keys(state.reviews)).toHaveLength(10);
		JSON.parse(await readFile(path, 'utf8'));
	});

	test('backs up corrupt JSON instead of overwriting it in place', async () => {
		const path = await temporaryStatePath();
		await writeFile(path, '{broken', 'utf8');
		const state = await readState(path);
		expect(state.reviews).toEqual({});
		const directory = path.slice(0, path.lastIndexOf('/'));
		const backups = Array.from(
			new Bun.Glob('state.json.corrupt-*').scanSync(directory),
		);
		expect(backups).toHaveLength(1);
		expect(reviewKey('owner/repo', 123)).toBe('owner/repo#123');
	});
});
