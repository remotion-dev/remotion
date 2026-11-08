import {expect, test} from 'bun:test';
import {mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
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

test('effect routes persist additions, duplication, reordering, deletion, and undo', async () => {
	const remotionRoot = mkdtempSync(join(tmpdir(), 'remotion-effect-routes-'));
	const filePath = join(remotionRoot, 'Comp.tsx');
	const bundlerUpdates: {
		files: string[];
		removed: string[];
		contents: string;
	}[] = [];
	const expectedBundlerUpdates: typeof bundlerUpdates = [];
	let closeWatcher: () => void = () => undefined;
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
			inputFileSystem: {purge: () => undefined},
			watch: () => ({
				close: () => undefined,
				pause: () => undefined,
				getFileTimeInfoEntries: () => new Map(),
				getContextTimeInfoEntries: () => new Map(),
			}),
		},
	} as unknown as webpack.Compiler;
	const plugin = new WatchIgnoreNextChangePlugin(() => undefined);
	plugin.apply(compiler);
	compiler.watchFileSystem!.watch(
		[filePath],
		[],
		[],
		Date.now(),
		{},
		(...args) => {
			const [error, , , changedFiles, removedFiles] = args;
			expect(error).toBeNull();
			bundlerUpdates.push({
				files: [...(changedFiles ?? [])],
				removed: [...(removedFiles ?? [])],
				contents: readFileSync(filePath, 'utf-8'),
			});
		},
		() => undefined,
	);
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
			await expectBundlerUpdates(readFileSync(filePath, 'utf-8'));
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

		const saved = await saveEffectPropsHandler({
			...context,
			input: {
				type: 'value',
				fileName: filePath,
				sequenceNodePath,
				effectIndex: 0,
				key: 'amount',
				value: '0.5',
				defaultValue: '1',
				schema: {amount: {type: 'number', default: 1, hiddenFromList: false}},
				clientId: 'effect-routes-test',
			},
		});
		expect(saved.canUpdate).toBe(true);
		expect(readFileSync(filePath, 'utf-8')).toMatch(/amount:\s*0\.5/);
		await expectBundlerUpdates(null);
		expect(popUndo().success).toBe(true);
		expect(readFileSync(filePath, 'utf-8')).toBe(reordered);
		await expectBundlerUpdates(null);

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
	} finally {
		closeWatcher();
		setWatchIgnoreNextChangePlugin(null);
		clearUndoStackForTests();
		cleanupFileWatcher();
		cleanupLiveEvents();
		rmSync(remotionRoot, {recursive: true, force: true});
	}
});
