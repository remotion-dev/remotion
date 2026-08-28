import {expect, test} from 'bun:test';
import {mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import type {
	EventSourceEvent,
	SequenceNodePathMutation,
} from '@remotion/studio-shared';
import {
	createFileWatcherRegistry,
	setFileWatcherRegistry,
} from '../file-watcher';
import {setLiveEventsListener} from '../preview-server/live-events';
import {duplicateJsxNodeHandler} from '../preview-server/routes/duplicate-jsx-node';
import {insertJsxElementHandler} from '../preview-server/routes/insert-jsx-element';
import {reorderSequenceHandler} from '../preview-server/routes/reorder-sequence';
import {splitJsxSequenceHandler} from '../preview-server/routes/split-jsx-sequence';
import {
	clearUndoStackForTests,
	popRedo,
	popUndo,
} from '../preview-server/undo-stack';
import {lineContainingToNodePath} from './test-utils';

const initialSource = `import {Composition, Sequence} from 'remotion';

export const Comp = () => (
	<>
		<Sequence name="a" from={0} durationInFrames={50} />
		<Sequence name="b" from={10} durationInFrames={50} />
		<Sequence name="c" from={20} durationInFrames={50} />
	</>
);

export const InsertComp = () => <div />;

export const Root = () => (
	<>
		<Composition id="comp" component={Comp} durationInFrames={100} fps={30} width={1920} height={1080} />
		<Composition id="insert" component={InsertComp} durationInFrames={100} fps={30} width={1920} height={1080} />
	</>
);
`;

test('JSX structure routes broadcast and return node path mutations before writing', async () => {
	clearUndoStackForTests();
	const fileWatcherRegistry = createFileWatcherRegistry();
	const cleanupFileWatcher = setFileWatcherRegistry(fileWatcherRegistry);
	const remotionRoot = mkdtempSync(join(tmpdir(), 'remotion-jsx-mutations-'));
	const fileName = 'Comp.tsx';
	const filePath = join(remotionRoot, fileName);
	writeFileSync(filePath, initialSource);
	const watcherSkipSequencePropsUpdates: boolean[] = [];
	const {unwatch} = fileWatcherRegistry.installFileWatcher({
		file: filePath,
		existenceOnly: false,
		onChange: (event) => {
			if (event.type === 'changed') {
				watcherSkipSequencePropsUpdates.push(event.skipSequencePropsUpdate);
			}
		},
	});
	const events: EventSourceEvent[] = [];
	const contentsAtMutation: string[] = [];
	const cleanupLiveEvents = setLiveEventsListener({
		addNewClientListener: () => () => undefined,
		closeConnections: () => Promise.resolve(),
		router: () => Promise.resolve(),
		sendEventToClient: (event) => {
			events.push(event);
			if (event.type === 'sequence-node-paths-remapped') {
				contentsAtMutation.push(readFileSync(filePath, 'utf-8'));
			}
		},
		sendEventToClientId: () => true,
	});
	const handlerContext = {
		binariesDirectory: null,
		configFile: null,
		entryPoint: filePath,
		getDefaultCodingAgent: () => null,
		getDefaultEditor: () => null,
		logLevel: 'error' as const,
		methods: {
			addJob: () => undefined,
			cancelJob: () => undefined,
			removeJob: () => undefined,
		},
		publicDir: remotionRoot,
		remotionRoot,
		request: {} as never,
		response: {} as never,
	};
	const assertMutation = ({
		before,
		mutation,
	}: {
		before: string;
		mutation: SequenceNodePathMutation;
	}) => {
		expect(
			events.filter((event) => event.type === 'sequence-node-paths-remapped'),
		).toEqual([{type: 'sequence-node-paths-remapped', mutation}]);
		expect(contentsAtMutation).toEqual([before]);
		expect(watcherSkipSequencePropsUpdates).toEqual([true]);
		expect(mutation.files[0].absolutePath).toBe(filePath);
		expect(mutation.files[0].remappings.length).toBeGreaterThan(0);
		events.length = 0;
		contentsAtMutation.length = 0;
		watcherSkipSequencePropsUpdates.length = 0;
	};

	const invertMutationFiles = (
		files: SequenceNodePathMutation['files'],
	): SequenceNodePathMutation['files'] =>
		files.map((file) => ({
			absolutePath: file.absolutePath,
			remappings: file.remappings.map((remapping) => ({
				oldNodePath: remapping.newNodePath,
				newNodePath: remapping.oldNodePath,
			})),
		}));

	try {
		const forwardMutationFiles: SequenceNodePathMutation['files'][] = [];
		let before = readFileSync(filePath, 'utf-8');
		const subscriptionKey = (search: string) => ({
			absolutePath: filePath,
			assetKeys: [],
			effectKeys: [],
			nodePath: lineContainingToNodePath(before, search),
			sequenceKeys: ['name'],
			videoConfigValues: null,
		});
		const reorderResponse = await reorderSequenceHandler({
			...handlerContext,
			input: {
				clientId: 'initiating-client',
				fileName,
				position: 'after',
				sourceNodePath: subscriptionKey('name="a"'),
				targetNodePath: subscriptionKey('name="c"'),
			},
		});
		if (!reorderResponse.success) {
			throw new Error(reorderResponse.reason);
		}

		assertMutation({before, mutation: reorderResponse.nodePathMutation});
		forwardMutationFiles.push(reorderResponse.nodePathMutation.files);
		expect(
			reorderResponse.nodePathMutation.files[0].remappings.every(
				(remapping) =>
					remapping.oldNodePath !== null && remapping.newNodePath !== null,
			),
		).toBe(true);

		before = readFileSync(filePath, 'utf-8');
		const duplicateResponse = await duplicateJsxNodeHandler({
			...handlerContext,
			input: {
				nodes: [
					{
						fileName,
						nodePath: lineContainingToNodePath(before, 'name="b"'),
					},
					{
						fileName,
						nodePath: lineContainingToNodePath(before, 'name="c"'),
					},
				],
			},
		});
		if (!duplicateResponse.success) {
			throw new Error(duplicateResponse.reason);
		}

		assertMutation({before, mutation: duplicateResponse.nodePathMutation});
		forwardMutationFiles.push(duplicateResponse.nodePathMutation.files);
		expect(
			duplicateResponse.nodePathMutation.files[0].remappings.some(
				(remapping) =>
					remapping.oldNodePath === null && remapping.newNodePath !== null,
			),
		).toBe(true);
		expect(readFileSync(filePath, 'utf-8')).toContain('name="b-copy"');
		expect(readFileSync(filePath, 'utf-8')).toContain('name="c-copy"');

		before = readFileSync(filePath, 'utf-8');
		const splitResponse = await splitJsxSequenceHandler({
			...handlerContext,
			input: {
				fileName,
				nodePath: lineContainingToNodePath(before, 'name="c"'),
				sequenceKeys: ['from', 'durationInFrames', 'trimBefore'],
				splitFrame: 30,
			},
		});
		if (!splitResponse.success) {
			throw new Error(splitResponse.reason);
		}

		assertMutation({before, mutation: splitResponse.nodePathMutation});
		forwardMutationFiles.push(splitResponse.nodePathMutation.files);
		expect(
			splitResponse.nodePathMutation.files[0].remappings.some(
				(remapping) =>
					remapping.oldNodePath === null && remapping.newNodePath !== null,
			),
		).toBe(true);

		before = readFileSync(filePath, 'utf-8');
		const insertResponse = await insertJsxElementHandler({
			...handlerContext,
			input: {
				compositionFile: fileName,
				compositionId: 'insert',
				element: {
					type: 'solid',
					width: 1920,
					height: 1080,
					position: null,
				},
				from: null,
			},
		});
		if (!insertResponse.success) {
			throw new Error(insertResponse.reason);
		}

		assertMutation({before, mutation: insertResponse.nodePathMutation});
		forwardMutationFiles.push(insertResponse.nodePathMutation.files);

		for (let i = 0; i < 4; i++) {
			before = readFileSync(filePath, 'utf-8');
			const undoResponse = popUndo();
			if (!undoResponse.success || undoResponse.nodePathMutation === null) {
				throw new Error('Expected undo to include a node path mutation');
			}

			expect(undoResponse.nodePathMutation.files).toEqual(
				invertMutationFiles(forwardMutationFiles[3 - i]),
			);
			assertMutation({before, mutation: undoResponse.nodePathMutation});
		}

		expect(readFileSync(filePath, 'utf-8')).toBe(initialSource);

		for (let i = 0; i < 4; i++) {
			before = readFileSync(filePath, 'utf-8');
			const redoResponse = popRedo();
			if (!redoResponse.success || redoResponse.nodePathMutation === null) {
				throw new Error('Expected redo to include a node path mutation');
			}

			expect(redoResponse.nodePathMutation.files).toEqual(
				forwardMutationFiles[i],
			);
			assertMutation({before, mutation: redoResponse.nodePathMutation});
		}
	} finally {
		unwatch();
		cleanupLiveEvents();
		cleanupFileWatcher();
		clearUndoStackForTests();
		rmSync(remotionRoot, {recursive: true, force: true});
	}
});
