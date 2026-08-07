import {expect, test} from 'bun:test';
import {mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import type {EventSourceEvent} from '@remotion/studio-shared';
import {deleteJsxNode, deleteJsxNodes} from '../codemods/delete-jsx-node';
import {
	createFileWatcherRegistry,
	setFileWatcherRegistry,
	writeFileAndNotifyFileWatchers,
} from '../file-watcher';
import {setLiveEventsListener} from '../preview-server/live-events';
import {deleteJsxNodeHandler} from '../preview-server/routes/delete-jsx-node';
import {subscribeToSequenceProps} from '../preview-server/routes/subscribe-to-sequence-props';
import {unsubscribeClientSequencePropsWatchers} from '../preview-server/sequence-props-watchers';
import {
	clearUndoStackForTests,
	popRedo,
	popUndo,
} from '../preview-server/undo-stack';
import {lineColumnToNodePath} from './test-utils';

const sample = `import React from 'react';
import {AbsoluteFill} from 'remotion';

export const X: React.FC = () => {
	return (
		<AbsoluteFill>
			<div />
		</AbsoluteFill>
	);
};
`;

test('deleteJsxNode removes a JSX child from a parent element', async () => {
	const {output} = await deleteJsxNode({
		input: sample,
		nodePath: lineColumnToNodePath(sample, 7),
	});

	expect(output).not.toContain('<div');
	expect(output).toContain('<AbsoluteFill>');
});

const onlyReturn = `import React from 'react';

export const X: React.FC = () => {
	return <div />;
};
`;

test('deleteJsxNode replaces sole return JSX with null', async () => {
	const {output} = await deleteJsxNode({
		input: onlyReturn,
		nodePath: lineColumnToNodePath(onlyReturn, 4),
	});

	expect(output).toContain('return null');
	expect(output).not.toContain('<div');
});

const conditional = `import React from 'react';

export const X: React.FC<{show: boolean}> = ({show}) => {
	return <>{show && <div />}</>;
};
`;

test('deleteJsxNode turns conditional JSX into null', async () => {
	const {output} = await deleteJsxNode({
		input: conditional,
		nodePath: lineColumnToNodePath(conditional, 4),
	});

	expect(output).toContain('&& null');
	expect(output).not.toContain('<div');
});

const ternary = `import React from 'react';

export const X: React.FC<{show: boolean}> = ({show}) => {
	return <>{show ? <div /> : null}</>;
};
`;

test('deleteJsxNode replaces JSX in ternary consequent with null', async () => {
	const {output} = await deleteJsxNode({
		input: ternary,
		nodePath: lineColumnToNodePath(ternary, 4),
	});

	expect(output).toMatch(/\?\s*null/);
	expect(output).not.toContain('<div');
});

const mapCase = `import React from 'react';

export const X: React.FC = () => {
	return (
		<>
			{[1].map((i) => (
				<div key={i} />
			))}
		</>
	);
};
`;

test('deleteJsxNode replaces JSX inside map callback', async () => {
	const {output} = await deleteJsxNode({
		input: mapCase,
		nodePath: lineColumnToNodePath(mapCase, 7),
	});

	expect(output).not.toContain('<div');
	expect(output).toMatch(/=>\s*\(?\s*null/);
});

const multipleSiblings = `import React from 'react';
import {AbsoluteFill} from 'remotion';

export const X: React.FC = () => {
	return (
		<AbsoluteFill>
			<div />
			<span />
			<p />
		</AbsoluteFill>
	);
};
`;

test('deleteJsxNodes removes multiple JSX children in one transform', async () => {
	const {output, nodeLabels, logLines} = await deleteJsxNodes({
		input: multipleSiblings,
		nodePaths: [
			lineColumnToNodePath(multipleSiblings, 7),
			lineColumnToNodePath(multipleSiblings, 8),
		],
	});

	expect(output).not.toContain('<div');
	expect(output).not.toContain('<span');
	expect(output).toContain('<p');
	expect(nodeLabels).toEqual(['<div>', '<span>']);
	expect(logLines).toEqual([7, 8]);
});

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

test('deleting a JSX node remaps subscriptions for following siblings', async () => {
	clearUndoStackForTests();
	const cleanupFileWatcher = setFileWatcherRegistry(
		createFileWatcherRegistry(),
	);
	const events: EventSourceEvent[] = [];
	const cleanupLiveEvents = setLiveEventsListener({
		addNewClientListener: () => () => undefined,
		closeConnections: () => Promise.resolve(),
		router: () => Promise.resolve(),
		sendEventToClient: () => undefined,
		sendEventToClientId: (_clientId, event) => {
			events.push(event);
			return true;
		},
	});
	const remotionRoot = mkdtempSync(join(tmpdir(), 'remotion-delete-node-'));
	const fileName = 'Comp.tsx';
	const filePath = join(remotionRoot, fileName);
	const clientId = 'delete-node-test';
	writeFileSync(filePath, interactiveSiblings);
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
		for (const line of [6, 7, 8]) {
			const result = await subscribeToSequenceProps({
				...apiHandlerContext,
				input: {
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
				},
			});
			expect(result.success).toBe(true);
		}

		const response = await deleteJsxNodeHandler({
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
		expect(response.success).toBe(true);
		await Promise.resolve();

		const output = readFileSync(filePath, 'utf-8');
		expect(output).not.toContain('Eyebrow');
		expect(output).toContain('name="Title"');
		expect(output).toContain('name="Chart"');

		const updates = events.filter(
			(
				event,
			): event is Extract<
				EventSourceEvent,
				{type: 'sequence-props-remapped'}
			> => event.type === 'sequence-props-remapped',
		);
		expect(events.some((event) => event.type === 'lost-node-path')).toBe(false);
		expect(updates).toHaveLength(3);
		expect(
			updates.map((update) => {
				if (update.nodePath === null || update.result === null) {
					return {
						name: null,
						newNodePath: null,
						previousNodePath: update.previousNodePath.nodePath,
					};
				}

				if (!update.result.canUpdate) {
					throw new Error(
						'Expected surviving sequence props to remain editable',
					);
				}

				return {
					name: update.result.props.name,
					newNodePath: update.nodePath.nodePath,
					previousNodePath: update.previousNodePath.nodePath,
				};
			}),
		).toEqual([
			{
				name: null,
				newNodePath: null,
				previousNodePath: lineColumnToNodePath(interactiveSiblings, 6),
			},
			{
				name: {codeValue: 'Title', status: 'static'},
				newNodePath: lineColumnToNodePath(output, 6),
				previousNodePath: lineColumnToNodePath(interactiveSiblings, 7),
			},
			{
				name: {codeValue: 'Chart', status: 'static'},
				newNodePath: lineColumnToNodePath(output, 7),
				previousNodePath: lineColumnToNodePath(interactiveSiblings, 8),
			},
		]);

		events.length = 0;
		expect(popUndo()).toEqual({success: true});
		await Promise.resolve();
		expect(readFileSync(filePath, 'utf-8')).toBe(interactiveSiblings);
		expect(events.some((event) => event.type === 'lost-node-path')).toBe(false);
		expect(
			events.flatMap((event) => {
				if (
					event.type !== 'sequence-props-remapped' ||
					event.nodePath === null ||
					event.result === null ||
					!event.result.canUpdate
				) {
					return [];
				}

				return [
					{
						name: event.result.props.name,
						newNodePath: event.nodePath.nodePath,
						previousNodePath: event.previousNodePath.nodePath,
					},
				];
			}),
		).toEqual([
			{
				name: {codeValue: 'Eyebrow', status: 'static'},
				newNodePath: lineColumnToNodePath(interactiveSiblings, 6),
				previousNodePath: lineColumnToNodePath(interactiveSiblings, 6),
			},
			{
				name: {codeValue: 'Title', status: 'static'},
				newNodePath: lineColumnToNodePath(interactiveSiblings, 7),
				previousNodePath: lineColumnToNodePath(output, 6),
			},
			{
				name: {codeValue: 'Chart', status: 'static'},
				newNodePath: lineColumnToNodePath(interactiveSiblings, 8),
				previousNodePath: lineColumnToNodePath(output, 7),
			},
		]);

		events.length = 0;
		expect(popRedo()).toEqual({success: true});
		await Promise.resolve();
		expect(readFileSync(filePath, 'utf-8')).toBe(output);
		expect(events.some((event) => event.type === 'lost-node-path')).toBe(false);
		expect(
			events.filter((event) => event.type === 'sequence-props-remapped'),
		).toHaveLength(3);

		events.length = 0;
		writeFileAndNotifyFileWatchers(
			filePath,
			output.replace('name="Title"', 'name="Updated title"'),
			undefined,
		);
		await Promise.resolve();
		expect(events.some((event) => event.type === 'lost-node-path')).toBe(false);
		expect(
			events.flatMap((event) => {
				if (
					event.type !== 'sequence-props-updated' ||
					!event.result.canUpdate
				) {
					return [];
				}

				return [event.result.props.name];
			}),
		).toEqual([
			{codeValue: 'Updated title', status: 'static'},
			{codeValue: 'Chart', status: 'static'},
		]);
	} finally {
		unsubscribeClientSequencePropsWatchers(clientId);
		cleanupLiveEvents();
		cleanupFileWatcher();
		clearUndoStackForTests();
		rmSync(remotionRoot, {recursive: true, force: true});
	}
});
