import {expect, test} from 'bun:test';
import {mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {
	createFileWatcherRegistry,
	setFileWatcherRegistry,
} from '../file-watcher';
import {setLiveEventsListener} from '../preview-server/live-events';
import {addEffectHandler} from '../preview-server/routes/add-effect';
import {deleteEffectHandler} from '../preview-server/routes/delete-effect';
import {duplicateEffectHandler} from '../preview-server/routes/duplicate-effect';
import {reorderEffectHandler} from '../preview-server/routes/reorder-effect';
import {clearUndoStackForTests, popUndo} from '../preview-server/undo-stack';
import {lineContainingToNodePath} from './test-utils';

test('effect routes persist additions, duplication, reordering, deletion, and undo', async () => {
	const remotionRoot = mkdtempSync(join(tmpdir(), 'remotion-effect-routes-'));
	const filePath = join(remotionRoot, 'Comp.tsx');
	const cleanupFileWatcher = setFileWatcherRegistry(
		createFileWatcherRegistry(),
	);
	const cleanupLiveEvents = setLiveEventsListener({
		sendEventToClient: () => undefined,
		sendEventToClientId: () => true,
		router: () => Promise.resolve(),
		closeConnections: () => Promise.resolve(),
		addNewClientListener: () => () => undefined,
	});
	const context = {
		entryPoint: filePath,
		remotionRoot,
		request: {} as never,
		response: {} as never,
		logLevel: 'error' as const,
		methods: {
			removeJob: () => undefined,
			cancelJob: () => undefined,
			addJob: () => undefined,
		},
		publicDir: remotionRoot,
		binariesDirectory: null,
		configFile: null,
		getDefaultCodingAgent: () => null,
		getDefaultEditor: () => null,
	};
	const input = `import {Solid} from 'remotion';
const untouched  = { value : 'keep' };
const dimensions = {width: 100, height: 100};
const presets = [];
export const Comp = () => <>
	<Solid {...dimensions} />
	<Solid name="preset" effects={[...presets]} />
	<Solid name="overridden" effects={[...presets]} {...dimensions} />
</>;
`;

	try {
		clearUndoStackForTests();
		writeFileSync(filePath, input);
		const sequenceNodePath = {
			absolutePath: filePath,
			nodePath: lineContainingToNodePath(input, '<Solid'),
			sequenceKeys: [],
			effectKeys: [],
			videoConfigValues: null,
		};
		for (const effectName of ['brightness', 'contrast']) {
			const result = await addEffectHandler({
				...context,
				input: {
					fileName: filePath,
					sequenceNodePath,
					effectName,
					effectImportPath: `@remotion/effects/${effectName}`,
					effectConfig: {amount: 1.2},
					clientId: 'effect-routes-test',
				},
			});
			expect(result.success).toBe(true);
		}

		const duplicate = await duplicateEffectHandler({
			...context,
			input: [{fileName: filePath, sequenceNodePath, effectIndex: 0}],
		});
		expect(duplicate.success).toBe(true);
		expect(
			readFileSync(filePath, 'utf-8').match(/brightness\(\{/g),
		).toHaveLength(2);

		const reorder = await reorderEffectHandler({
			...context,
			input: {
				fileName: filePath,
				sequenceNodePath,
				fromIndex: 1,
				toIndex: 2,
				clientId: 'effect-routes-test',
			},
		});
		expect(reorder.success).toBe(true);
		const reordered = readFileSync(filePath, 'utf-8');
		expect(reordered.indexOf('brightness({')).toBeLessThan(
			reordered.indexOf('contrast({'),
		);
		expect(reordered.lastIndexOf('brightness({')).toBeGreaterThan(
			reordered.indexOf('contrast({'),
		);
		expect(reordered).toContain("const untouched  = { value : 'keep' };");

		const overridden = await addEffectHandler({
			...context,
			input: {
				fileName: filePath,
				sequenceNodePath: {
					...sequenceNodePath,
					nodePath: lineContainingToNodePath(
						reordered,
						'<Solid name="overridden"',
					),
				},
				effectName: 'brightness',
				effectImportPath: '@remotion/effects/brightness',
				effectConfig: {amount: 2},
				clientId: 'effect-routes-test',
			},
		});
		expect(overridden.success).toBe(false);
		expect(readFileSync(filePath, 'utf-8')).toBe(reordered);

		const deleted = await deleteEffectHandler({
			...context,
			input: [
				{type: 'all-effects', fileName: filePath, sequenceNodePath},
				{
					type: 'all-effects',
					fileName: filePath,
					sequenceNodePath: {
						...sequenceNodePath,
						nodePath: lineContainingToNodePath(
							reordered,
							'<Solid name="preset"',
						),
					},
				},
			],
		});
		expect(deleted.success).toBe(true);
		expect(readFileSync(filePath, 'utf-8')).toContain(
			'<Solid {...dimensions} />',
		);
		expect(readFileSync(filePath, 'utf-8')).toContain(
			'<Solid name="preset" />',
		);
		expect(popUndo().success).toBe(true);
		expect(readFileSync(filePath, 'utf-8')).toBe(reordered);
	} finally {
		clearUndoStackForTests();
		cleanupFileWatcher();
		cleanupLiveEvents();
		rmSync(remotionRoot, {recursive: true, force: true});
	}
});
