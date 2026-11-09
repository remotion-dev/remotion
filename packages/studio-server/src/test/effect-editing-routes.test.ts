import {expect, test} from 'bun:test';
import {EventEmitter} from 'node:events';
import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	statSync,
	utimesSync,
	writeFileSync,
} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname, join} from 'node:path';
import {WatchIgnoreNextChangePlugin, type webpack} from '@remotion/bundler';
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
import {saveEffectPropsHandler} from '../preview-server/routes/save-effect-props';
import {updateDefaultPropsHandler} from '../preview-server/routes/update-default-props';
import {
	clearUndoStackForTests,
	popRedo,
	popUndo,
} from '../preview-server/undo-stack';
import {setWatchIgnoreNextChangePlugin} from '../preview-server/watch-ignore-next-change';
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
		getClientIds: () => [],
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
		getClientIds: () => [],
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

test.each(['direct', 'fallback'] as const)(
	'effect edits preserve external changes with %s invalidation',
	async (invalidationMode) => {
		const hasDirectInvalidation = invalidationMode === 'direct';
		const remotionRoot = mkdtempSync(join(tmpdir(), 'remotion-effect-routes-'));
		const sourceDirectory = join(remotionRoot, 'src', 'components');
		const filePath = join(sourceDirectory, 'Comp.tsx');
		const siblingPath = join(sourceDirectory, 'Sibling.tsx');
		const sourceEcho = [
			filePath,
			sourceDirectory,
			dirname(sourceDirectory),
			remotionRoot,
		];
		const bundlerUpdates: {
			files: string[];
			removed: string[];
			contents: string | null;
		}[] = [];
		const expectedBundlerUpdates: typeof bundlerUpdates = [];
		let directInvalidations = 0;
		const purgedFiles = new Set<string>();
		let closeWatcher: () => void = () => undefined;
		type Watch = NonNullable<webpack.Compiler['watchFileSystem']>['watch'];
		let watcher: ReturnType<Watch> | null = null;
		const fileTimestamps = new Map<
			string,
			{timestamp: number; safeTime: number} | {safeTime: number} | null
		>([[filePath, {safeTime: 0}]]);
		const directoryTimestamps: typeof fileTimestamps = new Map();
		const watchpack = Object.assign(new EventEmitter(), {
			paused: false,
			aggregatedChanges: new Set<string>(),
			aggregatedRemovals: new Set<string>(),
			pause: () => {
				watchpack.paused = true;
			},
			collectTimeInfoEntries: (
				files: typeof fileTimestamps,
				directories: typeof directoryTimestamps,
			) => {
				for (const [file, timestamp] of fileTimestamps)
					files.set(file, timestamp);
				for (const [directory, timestamp] of directoryTimestamps)
					directories.set(directory, timestamp);
			},
		});
		const compiler = {
			hooks: {
				afterEnvironment: {
					tap: (_name: string, callback: () => void) => callback(),
				},
				watchClose: {
					tap: (_name: string, callback: () => void) => {
						closeWatcher = callback;
					},
				},
			},
			watchFileSystem: {
				watcher: watchpack,
				inputFileSystem: {purge: (file: string) => purgedFiles.add(file)},
				watch: (...args: Parameters<Watch>) => {
					const callback = args[5];
					watchpack.once('change', args[6]);
					watchpack.once(
						'aggregated',
						(changes: Set<string>, removals: Set<string>) => {
							watchpack.pause();
							callback(
								null,
								new Map(fileTimestamps),
								new Map(directoryTimestamps),
								changes,
								removals,
							);
						},
					);
					return {
						close: () => undefined,
						pause: () => watchpack.pause(),
						getFileTimeInfoEntries: () => new Map(fileTimestamps),
						getContextTimeInfoEntries: () => new Map(directoryTimestamps),
						getInfo: () => ({
							changes: new Set(watchpack.aggregatedChanges),
							removals: new Set(watchpack.aggregatedRemovals),
							fileTimeInfoEntries: new Map(fileTimestamps),
							contextTimeInfoEntries: new Map(directoryTimestamps),
						}),
					};
				},
			},
		} as unknown as webpack.Compiler;
		const plugin = new WatchIgnoreNextChangePlugin(() => undefined);
		plugin.apply(compiler);
		const recordUpdate = (
			changedFiles: Set<string>,
			removedFiles: Set<string>,
		) => {
			bundlerUpdates.push({
				files: [...changedFiles],
				removed: [...removedFiles],
				contents: existsSync(filePath) ? readFileSync(filePath, 'utf-8') : null,
			});
		};

		const startWatching = (): ReturnType<Watch> =>
			compiler.watchFileSystem!.watch(
				[filePath, siblingPath],
				[sourceDirectory],
				[],
				Date.now(),
				{},
				(...args) => {
					const [error, , , changedFiles, removedFiles] = args;
					expect(error).toBeNull();
					recordUpdate(changedFiles ?? new Set(), removedFiles ?? new Set());
				},
				() => undefined,
			);
		watcher = startWatching();
		const watching = {
			...(hasDirectInvalidation
				? {
						invalidateWithChangesAndRemovals(
							this: unknown,
							changedFiles: Set<string>,
							removedFiles: Set<string>,
						) {
							expect(this).toBe(watching);
							for (const file of [...changedFiles, ...removedFiles])
								expect(purgedFiles.has(file)).toBe(true);
							directInvalidations++;
							watcher!.pause();
							const info = watcher!.getInfo!();
							recordUpdate(
								new Set([...changedFiles, ...(info.changes ?? [])]),
								new Set([...removedFiles, ...(info.removals ?? [])]),
							);
							watchpack.removeAllListeners();
							watchpack.paused = false;
							watcher = startWatching();
						},
					}
				: {}),
		};
		Object.assign(compiler, {watching});
		const emitFilesystemChange = (changes: string[], removals: string[]) => {
			for (
				let directory = sourceDirectory;
				directory !== dirname(directory);
				directory = dirname(directory)
			) {
				fileTimestamps.set(directory, {safeTime: 0});
				directoryTimestamps.set(directory, {safeTime: 0});
			}

			for (const file of [...fileTimestamps.keys(), ...changes, ...removals]) {
				const stat = statSync(file, {throwIfNoEntry: false});
				fileTimestamps.set(
					file,
					stat
						? stat.isDirectory()
							? {safeTime: 0}
							: {timestamp: stat.mtimeMs, safeTime: Date.now()}
						: null,
				);
			}

			watchpack.aggregatedChanges = new Set(changes);
			watchpack.aggregatedRemovals = new Set(removals);
			watchpack.emit('change', changes[0] ?? removals[0], Date.now());
			watchpack.emit('aggregated', new Set(changes), new Set(removals));
			watchpack.aggregatedChanges.clear();
			watchpack.aggregatedRemovals.clear();
			if (watchpack.paused) {
				watchpack.removeAllListeners();
				watchpack.paused = false;
				watcher = startWatching();
			}
		};

		setWatchIgnoreNextChangePlugin(plugin);
		const expectBundlerUpdates = async (newContents: string | null) => {
			if (newContents !== null) {
				expectedBundlerUpdates.push({
					files: [filePath, sourceDirectory],
					removed: [],
					contents: newContents,
				});
			}

			await new Promise<void>((resolve) => setImmediate(resolve));
			expect(bundlerUpdates).toEqual(expectedBundlerUpdates);
		};

		const cleanupFileWatcher = setFileWatcherRegistry(
			createFileWatcherRegistry(),
		);
		const cleanupLiveEvents = setLiveEventsListener({
			sendEventToClient: () => undefined,
			sendEventToClientId: () => true,
			router: () => Promise.resolve(),
			closeConnections: () => Promise.resolve(),
			getClientIds: () => [],
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
		const input = `import {Composition, Solid} from 'remotion';
const untouched  = { value : 'keep' };
const dimensions = {width: 100, height: 100};
const presets = [];
export const Comp = () => <>
	<Solid {...dimensions} />
	<Solid name="preset" effects={[...presets]} />
	<Solid name="overridden" effects={[...presets]} {...dimensions} />
</>;
export const Root = () => <Composition id="Comp" component={Comp} width={100} height={100} fps={30} durationInFrames={30} defaultProps={{}} />;
`;

		try {
			clearUndoStackForTests();
			mkdirSync(sourceDirectory, {recursive: true});
			writeFileSync(filePath, input);
			writeFileSync(siblingPath, 'export const sibling = 1;');
			fileTimestamps.set(siblingPath, {
				timestamp: statSync(siblingPath).mtimeMs,
				safeTime: Date.now(),
			});
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
				await expectBundlerUpdates(readFileSync(filePath, 'utf-8'));
				expect(directInvalidations).toBe(
					hasDirectInvalidation ? expectedBundlerUpdates.length : 0,
				);
				emitFilesystemChange(sourceEcho, []);
				await expectBundlerUpdates(null);
			}

			const beforeUnchangedWrite = readFileSync(filePath, 'utf-8');
			for (const firstEcho of [[filePath], [sourceDirectory]]) {
				const unchangedDefaultProps = await updateDefaultPropsHandler({
					...context,
					input: {
						compositionId: 'Comp',
						defaultProps: '{}',
						enumPaths: [],
						symbolicatedStack: {
							originalFunctionName: null,
							originalFileName: filePath,
							originalLineNumber: 1,
							originalColumnNumber: 1,
							originalScriptCode: null,
						},
					},
				});
				expect(unchangedDefaultProps.success).toBe(true);
				expect(readFileSync(filePath, 'utf-8')).toBe(beforeUnchangedWrite);
				await expectBundlerUpdates(null);
				emitFilesystemChange(firstEcho, []);
				await expectBundlerUpdates(null);
				expect(plugin.consumeSuppressedFilesHistory()).toEqual([filePath]);
				emitFilesystemChange(sourceEcho, []);
				await expectBundlerUpdates(null);
				expect(plugin.consumeSuppressedFilesHistory()).toEqual([]);
			}

			const externallyEdited = beforeUnchangedWrite.replace(
				'width: 100',
				'width: 120',
			);
			writeFileSync(filePath, externallyEdited);
			emitFilesystemChange([filePath], []);
			expectedBundlerUpdates.push({
				files: [filePath],
				removed: [],
				contents: externallyEdited,
			});
			await expectBundlerUpdates(null);

			const duplicate = await duplicateEffectHandler({
				...context,
				input: [{fileName: filePath, sequenceNodePath, effectIndex: 0}],
			});
			expect(duplicate.success).toBe(true);
			expect(
				readFileSync(filePath, 'utf-8').match(/brightness\(\{/g),
			).toHaveLength(2);
			await expectBundlerUpdates(readFileSync(filePath, 'utf-8'));

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
			await expectBundlerUpdates(reordered);

			for (const value of ['0.5', '0.75']) {
				const saved = await saveEffectPropsHandler({
					...context,
					input: {
						type: 'value',
						fileName: filePath,
						sequenceNodePath,
						effectIndex: 0,
						key: 'amount',
						value,
						defaultValue: '1',
						schema: {
							amount: {type: 'number', default: 1, hiddenFromList: false},
						},
						clientId: 'effect-routes-test',
					},
				});
				expect(saved.canUpdate).toBe(true);
				expect(readFileSync(filePath, 'utf-8')).toContain(`amount: ${value}`);
				await expectBundlerUpdates(null);
				for (const echo of value === '0.5'
					? [sourceEcho]
					: [[filePath], sourceEcho.slice(1)]) {
					emitFilesystemChange(echo, []);
					await expectBundlerUpdates(null);
				}

				expect(popUndo().success).toBe(true);
				expect(readFileSync(filePath, 'utf-8')).toBe(reordered);
				await expectBundlerUpdates(null);
				for (const echo of value === '0.5'
					? [sourceEcho]
					: [[filePath], sourceEcho.slice(1)]) {
					emitFilesystemChange(echo, []);
					await expectBundlerUpdates(null);
				}
			}

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
			await expectBundlerUpdates(null);

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
			await expectBundlerUpdates(readFileSync(filePath, 'utf-8'));
			expect(popUndo().success).toBe(true);
			expect(readFileSync(filePath, 'utf-8')).toBe(reordered);
			await expectBundlerUpdates(reordered);

			for (const externalChange of ['sibling', 'edit', 'delete'] as const) {
				const save = await saveEffectPropsHandler({
					...context,
					input: {
						type: 'value',
						fileName: filePath,
						sequenceNodePath,
						effectIndex: 0,
						key: 'amount',
						value:
							externalChange === 'sibling'
								? '0.25'
								: externalChange === 'edit'
									? '0.5'
									: '0.75',
						defaultValue: '1',
						schema: {
							amount: {type: 'number', default: 1, hiddenFromList: false},
						},
						clientId: 'effect-routes-test',
					},
				});
				expect(save.canUpdate).toBe(true);
				await expectBundlerUpdates(null);
				if (externalChange === 'sibling') {
					writeFileSync(siblingPath, 'export const sibling = 2;');
					const later = new Date(Date.now() + 1000);
					utimesSync(siblingPath, later, later);
					emitFilesystemChange([sourceDirectory], []);
					expectedBundlerUpdates.push({
						files: [sourceDirectory],
						removed: [],
						contents: readFileSync(filePath, 'utf-8'),
					});
					await expectBundlerUpdates(null);
				} else if (externalChange === 'edit') {
					const edited = readFileSync(filePath, 'utf-8').replace(
						"'keep'",
						"'externally edited'",
					);
					writeFileSync(filePath, edited);
					emitFilesystemChange([filePath], []);
					expectedBundlerUpdates.push({
						files: [filePath],
						removed: [],
						contents: edited,
					});
					await expectBundlerUpdates(null);
				} else {
					rmSync(filePath);
					emitFilesystemChange([], [filePath]);
					expectedBundlerUpdates.push({
						files: [],
						removed: [filePath],
						contents: null,
					});
					await expectBundlerUpdates(null);
				}
			}
		} finally {
			closeWatcher();
			setWatchIgnoreNextChangePlugin(null);
			clearUndoStackForTests();
			cleanupFileWatcher();
			cleanupLiveEvents();
			rmSync(remotionRoot, {recursive: true, force: true});
		}
	},
);
