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
import {
	createFileWatcherRegistry,
	setFileWatcherRegistry,
} from '../file-watcher';
import {setLiveEventsListener} from '../preview-server/live-events';
import {addEffectHandler} from '../preview-server/routes/add-effect';
import {deleteEffectHandler} from '../preview-server/routes/delete-effect';
import {duplicateEffectHandler} from '../preview-server/routes/duplicate-effect';
import {reorderEffectHandler} from '../preview-server/routes/reorder-effect';
import {saveEffectPropsHandler} from '../preview-server/routes/save-effect-props';
import {clearUndoStackForTests, popUndo} from '../preview-server/undo-stack';
import {setWatchIgnoreNextChangePlugin} from '../preview-server/watch-ignore-next-change';
import {lineContainingToNodePath} from './test-utils';

test('effect edits notify the bundler immediately and preserve external file changes', async () => {
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
	let closeWatcher: () => void = () => undefined;
	type Watch = NonNullable<webpack.Compiler['watchFileSystem']>['watch'];
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
			inputFileSystem: {purge: () => undefined},
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
	const startWatching = () =>
		compiler.watchFileSystem!.watch(
			[filePath, siblingPath],
			[sourceDirectory],
			[],
			Date.now(),
			{},
			(...args) => {
				const [error, , , changedFiles, removedFiles] = args;
				expect(error).toBeNull();
				bundlerUpdates.push({
					files: [...(changedFiles ?? [])],
					removed: [...(removedFiles ?? [])],
					contents: existsSync(filePath)
						? readFileSync(filePath, 'utf-8')
						: null,
				});
			},
			() => undefined,
		);
	startWatching();
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
			startWatching();
		}
	};

	setWatchIgnoreNextChangePlugin(plugin);
	const expectBundlerUpdates = async (newContents: string | null) => {
		if (newContents !== null) {
			expectedBundlerUpdates.push({
				files: [filePath],
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
			emitFilesystemChange(sourceEcho, []);
			await expectBundlerUpdates(null);
		}

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
					schema: {amount: {type: 'number', default: 1, hiddenFromList: false}},
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
					schema: {amount: {type: 'number', default: 1, hiddenFromList: false}},
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
				await expectBundlerUpdates(edited);
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
});
