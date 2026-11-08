import {expect, test} from 'bun:test';
import {mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import type {SequenceNodePathMutation} from '@remotion/studio-shared';
import {
	createFileWatcherRegistry,
	setFileWatcherRegistry,
	type FileChangeEvent,
} from '../file-watcher';
import {setLiveEventsListener} from '../preview-server/live-events';
import {addEffectHandler} from '../preview-server/routes/add-effect';
import {deleteEffectHandler} from '../preview-server/routes/delete-effect';
import {duplicateEffectHandler} from '../preview-server/routes/duplicate-effect';
import {pasteEffectsHandler} from '../preview-server/routes/paste-effects';
import {reorderEffectHandler} from '../preview-server/routes/reorder-effect';
import {
	clearUndoStackForTests,
	popRedo,
	popUndo,
} from '../preview-server/undo-stack';
import {lineContainingToNodePath} from './test-utils';

test('effect routes return receipts for chained edits, animated paste, and undo', async () => {
	const remotionRoot = mkdtempSync(join(tmpdir(), 'remotion-effect-routes-'));
	const filePath = join(remotionRoot, 'Comp.tsx');
	const registry = createFileWatcherRegistry();
	const cleanupFileWatcher = setFileWatcherRegistry(registry);
	const mutations: SequenceNodePathMutation[] = [];
	const sourceChanges: FileChangeEvent[] = [];
	let unwatchSource: (() => void) | null = null;
	const cleanupLiveEvents = setLiveEventsListener({
		sendEventToClient: (event) => {
			if (event.type === 'sequence-node-paths-remapped') {
				mutations.push(event.mutation);
			}
		},
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
		unwatchSource = registry.installFileWatcher({
			file: filePath,
			existenceOnly: false,
			onChange: (event) => sourceChanges.push(event),
		}).unwatch;
		let sequenceNodePath = {
			absolutePath: filePath,
			nodePath: lineContainingToNodePath(input, '<Solid'),
			sequenceKeys: [],
			effectKeys: [],
			videoConfigValues: null,
		};
		const acceptMutation = (mutation: SequenceNodePathMutation | null) => {
			if (mutation === null)
				throw new Error('Expected source mutation receipt');

			expect(mutations.at(-1)).toEqual(mutation);
			expect(sourceChanges.at(-1)).toMatchObject({
				type: 'changed',
				skipSequencePropsUpdate: true,
			});
			const remapping = mutation.files
				.find(({absolutePath}) => absolutePath === filePath)
				?.remappings.find(
					({oldNodePath}) =>
						JSON.stringify(oldNodePath) ===
						JSON.stringify(sequenceNodePath.nodePath),
				);
			if (remapping) {
				if (remapping.newNodePath === null) {
					throw new Error('The sequence must survive effect edits');
				}

				sequenceNodePath = {
					...sequenceNodePath,
					nodePath: remapping.newNodePath,
				};
			}
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
			if (!result.success) throw new Error(result.reason);
			acceptMutation(result.nodePathMutation);
			expect(result.insertedEffect.nodePath).toEqual(sequenceNodePath.nodePath);
		}

		const duplicate = await duplicateEffectHandler({
			...context,
			input: [{fileName: filePath, sequenceNodePath, effectIndex: 0}],
		});
		if (!duplicate.success) throw new Error(duplicate.reason);
		acceptMutation(duplicate.nodePathMutation);
		expect(duplicate.duplicatedEffects).toEqual([
			{
				absolutePath: filePath,
				nodePath: sequenceNodePath.nodePath,
				effectIndex: 1,
			},
		]);
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
		if (!reorder.success) throw new Error(reorder.reason);
		acceptMutation(reorder.nodePathMutation);
		const reordered = readFileSync(filePath, 'utf-8');
		expect(reordered.indexOf('brightness({')).toBeLessThan(
			reordered.indexOf('contrast({'),
		);
		expect(reordered.lastIndexOf('brightness({')).toBeGreaterThan(
			reordered.indexOf('contrast({'),
		);
		expect(reordered).toContain("const untouched  = { value : 'keep' };");
		const changesBeforeNoopReorder = sourceChanges.length;
		expect(
			await reorderEffectHandler({
				...context,
				input: {
					fileName: filePath,
					sequenceNodePath,
					fromIndex: 0,
					toIndex: 0,
					clientId: 'effect-routes-test',
				},
			}),
		).toEqual({success: true, nodePathMutation: null});
		expect(sourceChanges).toHaveLength(changesBeforeNoopReorder);

		const pathBeforePaste = sequenceNodePath.nodePath;
		const pasted = await pasteEffectsHandler({
			...context,
			input: {
				targetFileName: filePath,
				targetSequenceNodePath: sequenceNodePath,
				type: 'effects-additive',
				effects: [
					{
						callee: 'blur',
						importPath: '@remotion/effects/blur',
						params: {
							radius: {
								type: 'keyframed',
								interpolationFunction: 'interpolate',
								keyframes: [
									{frame: 0, value: 0},
									{frame: 30, value: 12},
								],
								easing: [{type: 'linear'}],
								clamping: {left: 'clamp', right: 'clamp'},
							},
						},
					},
				],
				clientId: 'effect-routes-test',
				insertAtIndices: null,
			},
		});
		if (!pasted.success) throw new Error(pasted.reason);
		acceptMutation(pasted.nodePathMutation);
		expect(sequenceNodePath.nodePath).not.toEqual(pathBeforePaste);
		const beforeDeletion = readFileSync(filePath, 'utf-8');
		expect(beforeDeletion).toContain('useCurrentFrame()');
		expect(beforeDeletion).toContain('blur({');

		const overridden = await addEffectHandler({
			...context,
			input: {
				fileName: filePath,
				sequenceNodePath: {
					...sequenceNodePath,
					nodePath: lineContainingToNodePath(
						beforeDeletion,
						"<Solid name='overridden'",
					),
				},
				effectName: 'brightness',
				effectImportPath: '@remotion/effects/brightness',
				effectConfig: {amount: 2},
				clientId: 'effect-routes-test',
			},
		});
		expect(overridden.success).toBe(false);
		expect(readFileSync(filePath, 'utf-8')).toBe(beforeDeletion);

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
							beforeDeletion,
							"<Solid name='preset'",
						),
					},
				},
			],
		});
		if (!deleted.success) throw new Error(deleted.reason);
		acceptMutation(deleted.nodePathMutation);
		expect(readFileSync(filePath, 'utf-8')).toContain(
			'<Solid {...dimensions} />',
		);
		expect(readFileSync(filePath, 'utf-8')).toContain(
			"<Solid name='preset' />",
		);
		const changesBeforeNoopPaste = sourceChanges.length;
		expect(
			await pasteEffectsHandler({
				...context,
				input: {
					targetFileName: filePath,
					targetSequenceNodePath: sequenceNodePath,
					type: 'effects-replacing',
					effects: [],
					clientId: 'effect-routes-test',
					insertAtIndices: null,
				},
			}),
		).toEqual({success: true, nodePathMutation: null});
		expect(sourceChanges).toHaveLength(changesBeforeNoopPaste);

		const undoDelete = popUndo();
		if (!undoDelete.success || !undoDelete.nodePathMutation) {
			throw new Error('Expected effect deletion undo receipt');
		}

		acceptMutation(undoDelete.nodePathMutation);
		expect(readFileSync(filePath, 'utf-8')).toBe(beforeDeletion);
		const undoPaste = popUndo();
		if (!undoPaste.success || !undoPaste.nodePathMutation) {
			throw new Error('Expected animated paste undo receipt');
		}

		acceptMutation(undoPaste.nodePathMutation);
		expect(readFileSync(filePath, 'utf-8')).toBe(reordered);
		expect(sequenceNodePath.nodePath).toEqual(pathBeforePaste);
		const redoPaste = popRedo();
		if (!redoPaste.success || !redoPaste.nodePathMutation) {
			throw new Error('Expected animated paste redo receipt');
		}

		acceptMutation(redoPaste.nodePathMutation);
		expect(readFileSync(filePath, 'utf-8')).toBe(beforeDeletion);

		const otherFilePath = join(remotionRoot, 'Other.tsx');
		writeFileSync(otherFilePath, beforeDeletion);
		const targets = [filePath, otherFilePath].map((targetFile) => ({
			fileName: targetFile,
			sequenceNodePath: {...sequenceNodePath, absolutePath: targetFile},
			effectIndex: 0,
		}));
		const mutationsBeforeFailure = mutations.length;
		const invalidDuplicate = await duplicateEffectHandler({
			...context,
			input: [targets[0], {...targets[1], effectIndex: 99}],
		});
		expect(invalidDuplicate.success).toBe(false);
		expect(readFileSync(filePath, 'utf-8')).toBe(beforeDeletion);
		expect(readFileSync(otherFilePath, 'utf-8')).toBe(beforeDeletion);
		expect(mutations).toHaveLength(mutationsBeforeFailure);

		const duplicateAcrossFiles = await duplicateEffectHandler({
			...context,
			input: targets,
		});
		if (!duplicateAcrossFiles.success)
			throw new Error(duplicateAcrossFiles.reason);
		acceptMutation(duplicateAcrossFiles.nodePathMutation);
		expect(duplicateAcrossFiles.nodePathMutation.files).toHaveLength(2);
		for (const target of targets) {
			expect(
				readFileSync(target.fileName, 'utf-8').match(/brightness\(\{/g),
			).toHaveLength(3);
		}

		const undoDuplicateAcrossFiles = popUndo();
		if (
			!undoDuplicateAcrossFiles.success ||
			!undoDuplicateAcrossFiles.nodePathMutation
		) {
			throw new Error('Expected multi-file duplication undo receipt');
		}

		acceptMutation(undoDuplicateAcrossFiles.nodePathMutation);
		expect(undoDuplicateAcrossFiles.nodePathMutation.files).toHaveLength(2);
		for (const target of targets) {
			expect(readFileSync(target.fileName, 'utf-8')).toBe(beforeDeletion);
		}

		const deleteAcrossFiles = await deleteEffectHandler({
			...context,
			input: targets.map((target) => ({
				...target,
				type: 'single-effect' as const,
			})),
		});
		if (!deleteAcrossFiles.success) throw new Error(deleteAcrossFiles.reason);
		acceptMutation(deleteAcrossFiles.nodePathMutation);
		for (const target of targets) {
			expect(
				readFileSync(target.fileName, 'utf-8').match(/brightness\(\{/g),
			).toHaveLength(1);
		}

		const undoDeleteAcrossFiles = popUndo();
		if (
			!undoDeleteAcrossFiles.success ||
			!undoDeleteAcrossFiles.nodePathMutation
		) {
			throw new Error('Expected multi-file deletion undo receipt');
		}

		acceptMutation(undoDeleteAcrossFiles.nodePathMutation);
		expect(undoDeleteAcrossFiles.nodePathMutation.files).toHaveLength(2);
		for (const target of targets) {
			expect(readFileSync(target.fileName, 'utf-8')).toBe(beforeDeletion);
		}
	} finally {
		clearUndoStackForTests();
		unwatchSource?.();
		cleanupFileWatcher();
		cleanupLiveEvents();
		rmSync(remotionRoot, {recursive: true, force: true});
	}
});

test('external changes reject queued and in-flight codemods without overwriting source or undo history', async () => {
	const {withSourceMutationGuard} =
		await import('../preview-server/source-mutation-guard');
	const {withSourceFileWriteQueue} =
		await import('../preview-server/routes/source-file-write-queue');
	const remotionRoot = mkdtempSync(join(tmpdir(), 'external-effect-edit-'));
	const filePath = join(remotionRoot, 'Comp.tsx');
	const otherFile = join(remotionRoot, 'Other.tsx');
	const original = `import {Solid} from 'remotion';\nexport const Comp = () => <Solid width={100} height={100} />;\n`;
	const external = original.replace('width={100}', 'width={200}');
	writeFileSync(filePath, original);
	writeFileSync(otherFile, original);
	const registry = createFileWatcherRegistry();
	const cleanupRegistry = setFileWatcherRegistry(registry);
	const events: string[] = [];
	const cleanupEvents = setLiveEventsListener({
		sendEventToClient: (event) => {
			events.push(event.type);
		},
		sendEventToClientId: () => true,
		router: () => Promise.resolve(),
		closeConnections: () => Promise.resolve(),
		addNewClientListener: () => () => undefined,
	});
	const sequenceNodePath = {
		absolutePath: filePath,
		nodePath: lineContainingToNodePath(original, '<Solid'),
		sequenceKeys: [],
		effectKeys: [],
		videoConfigValues: null,
	};
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
	const add = (fileName: string) =>
		addEffectHandler({
			...context,
			input: {
				fileName,
				sequenceNodePath: {...sequenceNodePath, absolutePath: fileName},
				effectName: 'brightness',
				effectImportPath: '@remotion/effects/brightness',
				effectConfig: {amount: 1.2},
				clientId: 'external-edit-test',
			},
		});
	const guard = (file: string) => ({
		sessionId: registry.sourceVersionSessionId,
		files: {[file]: registry.getExternalSourceRevision(file)},
	});
	let release = () => {};
	try {
		clearUndoStackForTests();
		const before = guard(filePath);
		const other = guard(otherFile);
		const held = new Promise<void>((resolve) => {
			release = resolve;
		});
		const blocking = withSourceFileWriteQueue(() => held);
		const queued = withSourceMutationGuard(before, () => add(filePath));
		const rejected = queued.catch((error: Error) => error.message);
		writeFileSync(filePath, external);
		release();
		await blocking;
		expect(await rejected).toContain('edited outside Studio');
		expect(readFileSync(filePath, 'utf8')).toBe(external);
		expect(events).toContain('external-source-changed');
		expect(events).not.toContain('sequence-node-paths-remapped');
		expect(popUndo().success).toBe(false);

		const independent = await withSourceMutationGuard(other, () =>
			add(otherFile),
		);
		expect(independent.success).toBe(true);
		expect(readFileSync(otherFile, 'utf8')).toContain('brightness({');
		const fresh = guard(filePath);
		const inFlight = withSourceMutationGuard(fresh, () => add(filePath));
		await Promise.resolve();
		const newest = original.replace('width={100}', 'width={300}');
		writeFileSync(filePath, newest);
		const result = await inFlight;
		expect(result.success).toBe(false);
		if (!result.success)
			expect(result.reason).toContain('edited outside Studio');
		expect(readFileSync(filePath, 'utf8')).toBe(newest);
		expect(popUndo().success).toBe(true);
		expect(readFileSync(otherFile, 'utf8')).toBe(original);
		expect(readFileSync(filePath, 'utf8')).toBe(newest);

		const nextGuard = guard(filePath);
		expect(
			(await withSourceMutationGuard(nextGuard, () => add(filePath))).success,
		).toBe(true);
		expect(
			(await withSourceMutationGuard(nextGuard, () => add(filePath))).success,
		).toBe(true);
		expect(readFileSync(filePath, 'utf8').match(/brightness\(/g)).toHaveLength(
			2,
		);
		writeFileSync(filePath, original);
		expect(popUndo().success).toBe(false);
		expect(readFileSync(filePath, 'utf8')).toBe(original);
	} finally {
		release();
		clearUndoStackForTests();
		cleanupEvents();
		cleanupRegistry();
		rmSync(remotionRoot, {recursive: true, force: true});
	}
});
