import {expect, test} from 'bun:test';
import {mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import type {
	EventSourceEvent,
	SubscribeToSequencePropsRequest,
} from '@remotion/studio-shared';
import {
	createFileWatcherRegistry,
	setFileWatcherRegistry,
} from '../file-watcher';
import {setLiveEventsListener} from '../preview-server/live-events';
import {deleteNodesHandler} from '../preview-server/routes/delete-nodes';
import {subscribeToSequenceProps} from '../preview-server/routes/subscribe-to-sequence-props';
import {unsubscribeClientSequencePropsWatchers} from '../preview-server/sequence-props-watchers';
import {
	clearUndoStackForTests,
	popRedo,
	popUndo,
} from '../preview-server/undo-stack';
import {lineColumnToNodePath} from './test-utils';

const interactiveSiblings = `import {Interactive} from 'remotion';

export const X = () => {
	return (
		<div>
			<Interactive.Div name="Eyebrow" />
			<Interactive.Div name="Title" />
			<Interactive.Div name="Chart" />
		</div>
	);
};
`;

const interactiveSiblingsAfterDelete = `import {Interactive} from 'remotion';

export const X = () => {
	return (
		<div>
			<Interactive.Div name="Title" />
			<Interactive.Div name="Chart" />
		</div>
	);
};
`;

test('deleting a JSX node broadcasts node path mutations for all clients', async () => {
	clearUndoStackForTests();
	const cleanupFileWatcher = setFileWatcherRegistry(
		createFileWatcherRegistry(),
	);
	const remotionRoot = mkdtempSync(join(tmpdir(), 'remotion-delete-node-'));
	const fileName = 'Comp.tsx';
	const filePath = join(remotionRoot, fileName);
	const clientId = 'delete-node-test';
	writeFileSync(filePath, interactiveSiblings);
	const events: EventSourceEvent[] = [];
	const mutationBroadcastFileContents: string[] = [];
	const cleanupLiveEvents = setLiveEventsListener({
		addNewClientListener: () => () => undefined,
		closeConnections: () => Promise.resolve(),
		router: () => Promise.resolve(),
		sendEventToClient: (event) => {
			events.push(event);
			if (event.type === 'sequence-node-paths-remapped') {
				mutationBroadcastFileContents.push(readFileSync(filePath, 'utf-8'));
			}
		},
		sendEventToClientId: (_clientId, event) => {
			events.push(event);
			return true;
		},
	});
	const apiHandlerContext = {
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

	try {
		const requests: SubscribeToSequencePropsRequest[] = [6, 7, 8].map(
			(line) => ({
				assetKeys: [],
				clientId,
				column: 0,
				componentIdentity: 'dev.remotion.remotion.Interactive.Div',
				effects: [],
				fileName,
				keys: ['name'],
				line,
				nodePath: lineColumnToNodePath(interactiveSiblings, line),
				videoConfigValues: {
					durationInFrames: 100,
					fps: 30,
					height: 1080,
					width: 1920,
				},
			}),
		);
		const subscription = await subscribeToSequenceProps({
			...apiHandlerContext,
			input: {requests},
		});
		expect(subscription.results.every((result) => result.success)).toBe(true);

		const response = await deleteNodesHandler({
			...apiHandlerContext,
			input: {
				nodes: [
					{
						fileName,
						nodePath: lineColumnToNodePath(interactiveSiblings, 6),
					},
				],
			},
		});
		if (!response.success) {
			throw new Error(response.reason);
		}

		await Promise.resolve();

		const output = readFileSync(filePath, 'utf-8');
		expect(output).toBe(interactiveSiblingsAfterDelete);
		expect(output).not.toContain('Eyebrow');
		expect(output).toContain('name="Title"');
		expect(output).toContain('name="Chart"');
		expect(response.nodePathMutation.files).toEqual([
			{
				absolutePath: filePath,
				remappings: [
					{
						oldNodePath: lineColumnToNodePath(interactiveSiblings, 6),
						newNodePath: null,
					},
					{
						oldNodePath: lineColumnToNodePath(interactiveSiblings, 7),
						newNodePath: lineColumnToNodePath(output, 6),
					},
					{
						oldNodePath: lineColumnToNodePath(interactiveSiblings, 8),
						newNodePath: lineColumnToNodePath(output, 7),
					},
				],
			},
		]);
		expect(
			events.filter((event) => event.type === 'sequence-node-paths-remapped'),
		).toEqual([
			{
				type: 'sequence-node-paths-remapped',
				mutation: response.nodePathMutation,
			},
		]);
		expect(mutationBroadcastFileContents).toEqual([interactiveSiblings]);
		expect(events.some((event) => event.type === 'lost-node-path')).toBe(false);
		expect(
			events.some((event) => event.type === 'sequence-props-updated'),
		).toBe(false);

		events.length = 0;
		const undoResponse = popUndo();
		if (!undoResponse.success || undoResponse.nodePathMutation === null) {
			throw new Error('Expected undo to include a node path mutation');
		}

		await Promise.resolve();
		expect(readFileSync(filePath, 'utf-8')).toBe(interactiveSiblings);
		expect(events.some((event) => event.type === 'lost-node-path')).toBe(false);
		expect(undoResponse.nodePathMutation.files).toEqual([
			{
				absolutePath: filePath,
				remappings: [
					{
						oldNodePath: null,
						newNodePath: lineColumnToNodePath(interactiveSiblings, 6),
					},
					{
						oldNodePath: lineColumnToNodePath(output, 6),
						newNodePath: lineColumnToNodePath(interactiveSiblings, 7),
					},
					{
						oldNodePath: lineColumnToNodePath(output, 7),
						newNodePath: lineColumnToNodePath(interactiveSiblings, 8),
					},
				],
			},
		]);
		expect(
			events.filter((event) => event.type === 'sequence-node-paths-remapped'),
		).toEqual([
			{
				type: 'sequence-node-paths-remapped',
				mutation: undoResponse.nodePathMutation,
			},
		]);
		expect(mutationBroadcastFileContents).toEqual([
			interactiveSiblings,
			output,
		]);

		events.length = 0;
		const redoResponse = popRedo();
		if (!redoResponse.success || redoResponse.nodePathMutation === null) {
			throw new Error('Expected redo to include a node path mutation');
		}

		await Promise.resolve();
		expect(readFileSync(filePath, 'utf-8')).toBe(output);
		expect(events.some((event) => event.type === 'lost-node-path')).toBe(false);
		expect(
			events.filter((event) => event.type === 'sequence-node-paths-remapped'),
		).toEqual([
			{
				type: 'sequence-node-paths-remapped',
				mutation: redoResponse.nodePathMutation,
			},
		]);
		expect(mutationBroadcastFileContents).toEqual([
			interactiveSiblings,
			output,
			interactiveSiblings,
		]);
	} finally {
		unsubscribeClientSequencePropsWatchers(clientId);
		cleanupLiveEvents();
		cleanupFileWatcher();
		clearUndoStackForTests();
		rmSync(remotionRoot, {recursive: true, force: true});
	}
});
