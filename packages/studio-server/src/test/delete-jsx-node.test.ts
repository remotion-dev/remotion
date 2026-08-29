import {expect, test} from 'bun:test';
import {mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import type {
	EventSourceEvent,
	SubscribeToSequencePropsRequest,
} from '@remotion/studio-shared';
import {deleteJsxNode, deleteJsxNodes} from '../codemods/delete-jsx-node';
import {
	createFileWatcherRegistry,
	setFileWatcherRegistry,
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
import {lineColumnToNodePath, lineContainingToNodePath} from './test-utils';

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

test('deleteJsxNodes preserves source formatting and removes standalone JSX lines', async () => {
	const cases = [
		{
			input: `export const Comp = () => {
	return (
		<div>
			<Keep />
			<RemoveOne />
			<RemoveTwo />
			<Keep />
		</div>
	);
};
`,
			markers: ['<RemoveOne', '<RemoveTwo'],
			expected: `export const Comp = () => {
	return (
		<div>
			<Keep />
			<Keep />
		</div>
	);
};
`,
		},
		{
			input: `export const Comp = () => {
  return (
    <div>
      <Remove />
    </div>
  )
}
`,
			markers: ['<Remove'],
			expected: `export const Comp = () => {
  return (
    <div>
    </div>
  )
}
`,
		},
		{
			input: `export const Comp = () => {
	return [1].map((item) => (
		<Remove key={item} />
	));
};
`,
			markers: ['<Remove'],
			expected: `export const Comp = () => {
	return [1].map((item) => null);
};
`,
		},
		{
			input: `const AnimatedBar = () => {
	return (
		<Remove />
	);
};
`,
			markers: ['<Remove'],
			expected: `const AnimatedBar = () => {
	return null;
};
`,
		},
		{
			input: `const AnimatedBar = () => {
	return (
		// Keep this explanation.
		<Remove />
	);
};
`,
			markers: ['<Remove'],
			expected: `const AnimatedBar = () => {
	return (
		// Keep this explanation.
		null
	);
};
`,
		},
		{
			input: `export const Comp = () => <div><Keep /><Remove /><Keep /></div>;
`,
			markers: ['<Remove'],
			expected: `export const Comp = () => <div><Keep /><Keep /></div>;
`,
		},
		{
			input:
				'export const Comp = () => <div><Keep />\t<Remove /><Keep /></div>;\n',
			markers: ['<Remove'],
			expected: 'export const Comp = () => <div><Keep />\t<Keep /></div>;\n',
		},
		{
			input: `export const Comp = () => (
	<div>
		<Remove /> {/* keep this comment */}
	</div>
);
`,
			markers: ['<Remove'],
			expected: `export const Comp = () => (
	<div>
		 {/* keep this comment */}
	</div>
);
`,
		},
		{
			input: `export const Comp = () => {
	return (
		<div>
			<RemoveParent>
				<RemoveChild />
			</RemoveParent>
			<Keep />
		</div>
	);
};
`,
			markers: ['<RemoveParent', '<RemoveChild'],
			expected: `export const Comp = () => {
	return (
		<div>
			<Keep />
		</div>
	);
};
`,
		},
		{
			input:
				'export const Comp = () => {\r\n\treturn (\r\n\t\t<div>\r\n\t\t\t<Remove />\r\n\t\t</div>\r\n\t);\r\n};\r\n',
			markers: ['<Remove'],
			expected:
				'export const Comp = () => {\r\n\treturn (\r\n\t\t<div>\r\n\t\t</div>\r\n\t);\r\n};\r\n',
		},
	] as const;

	for (const item of cases) {
		const {output, formatted} = await deleteJsxNodes({
			input: item.input,
			nodePaths: item.markers.map((marker) =>
				lineContainingToNodePath(item.input, marker),
			),
		});

		expect(output).toBe(item.expected);
		expect(formatted).toBe(true);
	}
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
			input: {
				...requests[0],
				requests,
			},
		});
		expect(subscription.success).toBe(true);
		expect(subscription.results.every((result) => result.success)).toBe(true);

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
