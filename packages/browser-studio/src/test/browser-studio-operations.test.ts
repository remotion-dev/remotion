import {expect, test} from 'bun:test';
import {createElementPayload} from '@remotion/studio-protocol';
import type {EventSourceEvent} from '@remotion/studio-shared';
import type {InteractivitySchema} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import {
	createBrowserStudioOperations,
	insertSolidIntoProject,
	insertSolidIntoProjectWithNodePathRemappings,
} from '../browser-studio-operations';
import {createBlankTemplateProject} from '../templates/blank';
import type {VirtualProject} from '../types';

const insertSolid = (
	project: VirtualProject,
	compositionFile = '/project/src/Composition.tsx',
) => {
	return insertSolidIntoProject({
		project,
		request: {
			compositionFile,
			compositionId: 'MyComp',
			element: {
				type: 'solid',
				width: 1280,
				height: 720,
				position: null,
			},
			from: null,
		},
	});
};

test('consumes an initial Element payload only once', () => {
	const project = createBlankTemplateProject();
	const payload = createElementPayload({
		dependencies: [],
		dimensions: {height: 180, width: 320},
		displayName: 'Linked Element',
		durationInFrames: 60,
		installationMode: 'wrapped',
		slug: 'linked-element',
		sourceCode: 'export const LinkedElement = () => <div />;',
	});
	const operations = createBrowserStudioOperations({
		dependencyVersions: {},
		getProject: () => project,
		getStaticFiles: null,
		initialElement: {payload, sourceOrigin: 'https://elements.example.test'},
		onProjectChange: () => undefined,
		resolveDependencies: null,
	});

	expect(operations.consumeInitialElement()).toEqual({
		element: {
			...payload.element,
			durationInFrames: 60,
			installationMode: 'wrapped',
		},
		sourceOrigin: 'https://elements.example.test',
	});
	expect(operations.consumeInitialElement()).toBe(null);
});

test('adds a Solid to the blank Browser Studio project', () => {
	const project = createBlankTemplateProject();
	const updated = insertSolid(project);
	const composition = updated.files['/project/src/Composition.tsx'];

	expect(composition).toContain(
		'import { CalculateMetadataFunction, Composition, Solid } from "remotion";',
	);
	expect(composition).toContain(
		'<Solid width={1280} height={720} color="gray"',
	);
	expect(composition).toContain("style={{position: 'absolute'}}");
	expect(project.files['/project/src/Composition.tsx']).not.toContain('<Solid');
});

test('adds multiple Solids without duplicating the import', () => {
	const once = insertSolid(createBlankTemplateProject());
	const twice = insertSolid(once);
	const composition = twice.files['/project/src/Composition.tsx'];

	expect(composition.match(/\bSolid\b/g)).toHaveLength(3);
	expect(composition.match(/<Solid /g)).toHaveLength(2);
});

test('adds a Solid at a timeline frame', () => {
	const project = createBlankTemplateProject();
	const updated = insertSolidIntoProject({
		project,
		request: {
			compositionFile: '/project/src/Composition.tsx',
			compositionId: 'MyComp',
			from: 42,
			element: {
				type: 'solid',
				width: 1280,
				height: 720,
				position: {x: 100, y: 50},
			},
		},
	});
	const composition = updated.files['/project/src/Composition.tsx'];

	expect(composition).toContain('<Sequence from={42}');
	expect(composition).toContain("translate: '100px 50px'");
	expect(composition).toContain('<Solid width={1280} height={720}');
});

test('resolves an imported composition component', async () => {
	const project: VirtualProject = {
		rootDir: '/project',
		entryPoint: '/project/src/index.tsx',
		files: {
			'/project/src/index.tsx': `import {Composition, registerRoot} from 'remotion';
import {MyComponent} from './MyComponent';

const Root = () => <Composition id="MyComp" component={MyComponent} durationInFrames={60} fps={30} width={1280} height={720} />;
registerRoot(Root);
`,
			'/project/src/MyComponent.tsx': `import {AbsoluteFill} from 'remotion';

export const MyComponent = () => <AbsoluteFill>Existing</AbsoluteFill>;
`,
		},
	};
	const updated = insertSolid(project, 'src/index.tsx');

	expect(updated.files['/project/src/index.tsx']).toBe(
		project.files['/project/src/index.tsx'],
	);
	expect(updated.files['/project/src/MyComponent.tsx']).toContain(
		'<Solid width={1280}',
	);

	let currentProject = project;
	const operations = createBrowserStudioOperations({
		dependencyVersions: {},
		getStaticFiles: null,
		getProject: () => currentProject,
		initialElement: null,
		onProjectChange: (nextProject) => {
			currentProject = nextProject;
		},
		resolveDependencies: null,
	});
	expect(operations.getCompositionFile('MyComp')).toBe('src/index.tsx');
	expect(operations.getCompositionFile('Unknown')).toBeNull();

	const info = await operations.getCompositionComponentInfo({
		compositionFile: 'src/index.tsx',
		compositionId: 'MyComp',
	});

	expect(info).toEqual({
		canAddSequence: true,
		location: {
			source: 'src/MyComponent.tsx',
			line: 3,
			column: 13,
		},
	});

	const result = await operations.insertSolid({
		compositionFile: 'src/index.tsx',
		compositionId: 'MyComp',
		from: null,
		element: {
			type: 'solid',
			width: 1280,
			height: 720,
			position: null,
		},
	});
	expect(result.success).toBe(true);
	expect(currentProject.files['/project/src/MyComponent.tsx']).toContain(
		'<Solid',
	);
	expect(currentProject.files['/project/src/MyComponent.tsx']).toContain(
		'width={1280}',
	);
});

test('wraps a self-closing root, aliases bindings, and remaps the root', () => {
	const project: VirtualProject = {
		rootDir: '/project',
		entryPoint: '/project/src/index.tsx',
		files: {
			'/project/src/index.tsx': `import {AbsoluteFill, Composition, registerRoot} from 'remotion';

const Solid = () => null;
const Sequence = () => null;
const MyComponent = () => <AbsoluteFill />;
const Root = () => <Composition id="MyComp" component={MyComponent} durationInFrames={60} fps={30} width={1280} height={720} />;
registerRoot(Root);
`,
		},
	};
	const {project: updated, nodePathRemappings} =
		insertSolidIntoProjectWithNodePathRemappings({
			project,
			request: {
				compositionFile: '/project/src/index.tsx',
				compositionId: 'MyComp',
				from: null,
				element: {
					type: 'solid',
					width: 1280,
					height: 720,
					position: null,
				},
			},
		});
	const output = updated.files['/project/src/index.tsx'];

	expect(output).toContain(
		"import {AbsoluteFill, Composition, registerRoot, Solid as RemotionSolid, Sequence as RemotionSequence} from 'remotion';",
	);
	expect(output).toContain('<RemotionSequence>');
	expect(output).toContain('<RemotionSolid width={1280}');
	expect(nodePathRemappings).toHaveLength(3);
	expect(nodePathRemappings).toEqual(
		expect.arrayContaining([
			expect.objectContaining({oldNodePath: expect.any(Array)}),
			expect.objectContaining({oldNodePath: null}),
		]),
	);
});

test('inserting a Solid broadcasts remappings without refreshing stale subscriptions', async () => {
	const fileName = '/project/src/Composition.tsx';
	let currentProject: VirtualProject = {
		rootDir: '/project',
		entryPoint: '/project/src/index.tsx',
		files: {
			'/project/src/index.tsx': `import {registerRoot} from 'remotion';
import {Root} from './Composition';
registerRoot(Root);`,
			[fileName]: `import {Composition, Sequence} from 'remotion';
export const Component = () => <Sequence from={10} durationInFrames={20} />;
export const Root = () => <Composition id="MyComp" component={Component} durationInFrames={60} fps={30} width={1280} height={720} />;`,
		},
	};
	const operations = createBrowserStudioOperations({
		dependencyVersions: {},
		getStaticFiles: null,
		getProject: () => currentProject,
		initialElement: null,
		onProjectChange: (nextProject) => {
			currentProject = nextProject;
		},
		resolveDependencies: null,
	});
	const events: EventSourceEvent[] = [];
	operations.subscribeToEvent((event) => events.push(event));
	const subscription = await operations.subscribeToSequenceProps({
		fileName: 'src/Composition.tsx',
		line: 2,
		column: 31,
		nodePath: null,
		componentIdentity: 'dev.remotion.remotion.Sequence',
		keys: ['from', 'durationInFrames'],
		assetKeys: [],
		effects: [],
		clientId: 'browser-studio',
		videoConfigValues: {
			durationInFrames: 60,
			fps: 30,
			height: 720,
			width: 1280,
		},
	});
	if (!subscription.success) {
		throw new Error('Expected sequence props subscription to succeed');
	}

	events.length = 0;
	const result = await operations.insertSolid({
		compositionFile: fileName,
		compositionId: 'MyComp',
		from: null,
		element: {
			type: 'solid',
			width: 1280,
			height: 720,
			position: null,
		},
	});
	if (!result.success) {
		throw new Error(result.reason);
	}

	expect(result.nodePathMutation.files).toEqual([
		{
			absolutePath: fileName,
			remappings: expect.arrayContaining([
				{
					oldNodePath: subscription.nodePath.nodePath,
					newNodePath: expect.any(Array),
				},
				{
					oldNodePath: null,
					newNodePath: expect.any(Array),
				},
			]),
		},
	]);
	expect(
		events.filter((event) => event.type === 'sequence-node-paths-remapped'),
	).toEqual([
		{
			type: 'sequence-node-paths-remapped',
			mutation: result.nodePathMutation,
		},
	]);
	expect(
		events.some(
			(event) =>
				event.type === 'lost-node-path' ||
				event.type === 'sequence-props-updated',
		),
	).toBe(false);
});

test('splits video from audio, broadcasts remappings and supports undo', async () => {
	const fileName = '/project/src/Composition.tsx';
	const initialSource = `import {Video} from '@remotion/media';
export const Component = () => <Video src="video.mp4" from={10} durationInFrames={20} volume={0.5} style={{opacity: 0.5}} />;`;
	let currentProject: VirtualProject = {
		rootDir: '/project',
		entryPoint: '/project/src/index.tsx',
		files: {
			'/project/src/index.tsx': `import {registerRoot} from 'remotion';
import {Root} from './Composition';
registerRoot(Root);`,
			[fileName]: initialSource,
		},
	};
	const operations = createBrowserStudioOperations({
		dependencyVersions: {},
		getStaticFiles: null,
		getProject: () => currentProject,
		initialElement: null,
		onProjectChange: (nextProject) => {
			currentProject = nextProject;
		},
		resolveDependencies: null,
	});
	const events: EventSourceEvent[] = [];
	operations.subscribeToEvent((event) => events.push(event));
	const subscription = await operations.subscribeToSequenceProps({
		fileName: 'src/Composition.tsx',
		line: 2,
		column: 31,
		nodePath: null,
		componentIdentity: 'dev.remotion.media.Video',
		keys: ['from', 'durationInFrames'],
		assetKeys: [],
		effects: [],
		clientId: 'browser-studio',
		videoConfigValues: {
			durationInFrames: 60,
			fps: 30,
			height: 720,
			width: 1280,
		},
	});
	if (!subscription.success) {
		throw new Error('Expected sequence props subscription to succeed');
	}

	events.length = 0;
	const result = await operations.splitVideoFromAudio({
		fileName: 'src/Composition.tsx',
		nodePath: subscription.nodePath.nodePath,
	});
	if (!result.success) {
		throw new Error(result.reason);
	}

	const output = currentProject.files[fileName];
	const singleLine = output.replace(/\s+/g, ' ');
	expect(output).toContain(`import {Video, Audio} from '@remotion/media';`);
	expect(singleLine).toContain(
		'<Video src="video.mp4" from={10} durationInFrames={20} volume={0.5} style={{opacity: 0.5}} muted />',
	);
	expect(singleLine).toContain(
		'<Audio src="video.mp4" from={10} durationInFrames={20} volume={0.5} />',
	);
	expect(
		events.filter((event) => event.type === 'sequence-node-paths-remapped'),
	).toEqual([
		{
			type: 'sequence-node-paths-remapped',
			mutation: result.nodePathMutation,
		},
	]);

	const undoResult = await operations.undo();
	expect(undoResult.success).toBe(true);
	expect(currentProject.files[fileName]).toBe(initialSource);
});

test('reports invalid timeline Solid input without changing the project', async () => {
	const project = createBlankTemplateProject();
	let currentProject = project;
	const operations = createBrowserStudioOperations({
		dependencyVersions: {},
		getStaticFiles: null,
		getProject: () => currentProject,
		initialElement: null,
		onProjectChange: (nextProject) => {
			currentProject = nextProject;
		},
		resolveDependencies: null,
	});

	const result = await operations.insertSolid({
		compositionFile: '/project/src/Composition.tsx',
		compositionId: 'MyComp',
		from: 1.5,
		element: {
			type: 'solid',
			width: 1280,
			height: 720,
			position: null,
		},
	});

	expect(result.success).toBe(false);
	if (!result.success) {
		expect(result.reason).toBe('from must be a non-negative integer');
	}

	expect(currentProject).toBe(project);
});

test('subscribes to default prop updates in the virtual project', async () => {
	let currentProject: VirtualProject = {
		rootDir: '/project',
		entryPoint: '/project/src/index.tsx',
		files: {
			'/project/src/index.tsx': `import {Composition, registerRoot} from 'remotion';
const Component = () => null;
const Root = () => <Composition id="MyComp" component={Component} durationInFrames={60} fps={30} width={1280} height={720} defaultProps={{title: 'Before'}} />;
registerRoot(Root);`,
		},
	};
	const operations = createBrowserStudioOperations({
		dependencyVersions: {},
		getStaticFiles: null,
		getProject: () => currentProject,
		initialElement: null,
		onProjectChange: (nextProject) => {
			currentProject = nextProject;
		},
		resolveDependencies: null,
	});
	const events: EventSourceEvent[] = [];
	operations.subscribeToEvent((event) => events.push(event));

	expect(
		await operations.subscribeToDefaultProps({
			clientId: 'browser-studio',
			compositionId: 'MyComp',
		}),
	).toEqual({
		canUpdate: true,
		currentDefaultProps: {title: 'Before'},
	});

	currentProject = {
		...currentProject,
		files: {
			...currentProject.files,
			'/project/src/index.tsx': currentProject.files[
				'/project/src/index.tsx'
			].replace("title: 'Before'", "title: 'After'"),
		},
	};
	operations.resetHistory();
	expect(
		events.filter((event) => event.type === 'default-props-updatable-changed'),
	).toEqual([
		{
			type: 'default-props-updatable-changed',
			compositionId: 'MyComp',
			result: {
				canUpdate: true,
				currentDefaultProps: {title: 'After'},
			},
		},
	]);

	await operations.unsubscribeFromDefaultProps({
		clientId: 'browser-studio',
		compositionId: 'MyComp',
	});
	currentProject = {
		...currentProject,
		files: {
			...currentProject.files,
			'/project/src/index.tsx': currentProject.files[
				'/project/src/index.tsx'
			].replace("title: 'After'", "title: 'Ignored'"),
		},
	};
	operations.resetHistory();
	expect(
		events.filter((event) => event.type === 'default-props-updatable-changed'),
	).toHaveLength(1);
});

test('saves sequence props with events and undo history', async () => {
	const fileName = '/project/src/Composition.tsx';
	let currentProject: VirtualProject = {
		rootDir: '/project',
		entryPoint: '/project/src/index.tsx',
		files: {
			'/project/src/index.tsx': `import {registerRoot} from 'remotion';
import {Root} from './Composition';
registerRoot(Root);`,
			[fileName]: `import {Composition, Sequence} from 'remotion';
export const Component = () => <Sequence from={10} durationInFrames={20} />;
export const Root = () => <Composition id="MyComp" component={Component} durationInFrames={60} fps={30} width={1280} height={720} />;`,
		},
	};
	const operations = createBrowserStudioOperations({
		dependencyVersions: {},
		getStaticFiles: null,
		getProject: () => currentProject,
		initialElement: null,
		onProjectChange: (nextProject) => {
			currentProject = nextProject;
		},
		resolveDependencies: null,
	});
	const events: EventSourceEvent[] = [];
	operations.subscribeToEvent((event) => events.push(event));

	const request = {
		fileName: 'src/Composition.tsx',
		line: 2,
		column: 31,
		nodePath: null,
		componentIdentity: 'dev.remotion.remotion.Sequence',
		keys: ['from', 'durationInFrames'],
		assetKeys: [],
		effects: [],
		clientId: 'browser-studio',
		videoConfigValues: {
			durationInFrames: 60,
			fps: 30,
			height: 720,
			width: 1280,
		},
	};
	const subscription = await operations.subscribeToSequenceProps(request);
	expect(subscription.success).toBe(true);
	if (!subscription.success) {
		throw new Error('Expected sequence props subscription to succeed');
	}

	expect(subscription.status.props).toEqual({
		from: {
			status: 'static',
			codeValue: 10,
			keyframeDisplayOffsetAdjustment: null,
		},
		durationInFrames: {
			status: 'static',
			codeValue: 20,
			keyframeDisplayOffsetAdjustment: null,
		},
	});
	expect(subscription.nodePath.absolutePath).toBe(fileName);

	const saveResult = await operations.saveSequenceProps({
		edits: [
			{
				fileName: request.fileName,
				nodePath: subscription.nodePath,
				key: 'from',
				value: {type: 'json', serialized: '15'},
				defaultValue: '0',
				schema: {
					from: {
						type: 'number',
						default: 0,
						hiddenFromList: false,
					},
					durationInFrames: {
						type: 'number',
						default: null,
						hiddenFromList: false,
					},
				},
				sourceEdit: null,
			},
		],
		addedKeyframes: null,
		movedKeyframes: null,
		clientId: request.clientId,
		undoLabel: 'Update from',
		redoLabel: 'Update from again',
	});
	expect(saveResult.canUpdate).toBe(true);
	expect(currentProject.files[fileName]).toContain('from={15}');
	const update = events.findLast(
		(
			event,
		): event is Extract<EventSourceEvent, {type: 'sequence-props-updated'}> =>
			event.type === 'sequence-props-updated',
	);
	expect(update?.fileName).toBe('src/Composition.tsx');
	expect(update?.result.canUpdate).toBe(true);
	if (!update?.result.canUpdate) {
		throw new Error('Expected updated sequence props to be editable');
	}

	expect(update.result.props.from).toEqual({
		status: 'static',
		codeValue: 15,
		keyframeDisplayOffsetAdjustment: null,
	});
	expect(await operations.undo()).toEqual({
		success: true,
		nodePathMutation: null,
	});
	expect(currentProject.files[fileName]).toContain('from={10}');
	expect(await operations.redo()).toEqual({
		success: true,
		nodePathMutation: null,
	});
	expect(currentProject.files[fileName]).toContain('from={15}');

	await operations.saveSequenceProps({
		edits: [
			{
				fileName: request.fileName,
				nodePath: subscription.nodePath,
				key: 'style.rotate',
				value: {type: 'undefined'},
				defaultValue: JSON.stringify('0deg'),
				schema: {
					'style.rotate': {type: 'rotation-css', default: '0deg'},
				},
				sourceEdit: {
					type: 'clipboard-param',
					param: {
						type: 'keyframed',
						interpolationFunction: 'interpolate',
						keyframes: [
							{frame: 0, value: '0deg'},
							{frame: 30, value: '90deg'},
						],
						easing: [{type: 'linear'}],
						clamping: {left: 'extend', right: 'extend'},
					},
				},
			},
		],
		addedKeyframes: null,
		movedKeyframes: null,
		clientId: request.clientId,
		undoLabel: 'Paste property',
		redoLabel: 'Reapply property paste',
	});
	expect(currentProject.files[fileName]).toContain(
		'rotate: interpolate(frame, [0, 30], ["0deg", "90deg"])',
	);
	expect(await operations.undo()).toEqual({
		success: true,
		nodePathMutation: null,
	});
	expect(currentProject.files[fileName]).not.toContain('style={{rotate:');

	currentProject = {
		...currentProject,
		files: {
			...currentProject.files,
			[fileName]: currentProject.files[fileName].replace(
				'<Sequence from={15} durationInFrames={20} />',
				'<div />',
			),
		},
	};
	operations.resetHistory();
	expect(events.findLast((event) => event.type === 'lost-node-path')).toEqual({
		type: 'lost-node-path',
		fileName: 'src/Composition.tsx',
		line: 2,
		column: 31,
	});

	await operations.unsubscribeFromSequenceProps({
		fileName: request.fileName,
		nodePath: subscription.nodePath,
		clientId: request.clientId,
		sequenceKeys: request.keys.slice(),
		assetKeys: [],
		effectKeys: [],
	});
	const sequenceEventCount = events.filter(
		(event) =>
			event.type === 'sequence-props-updated' ||
			event.type === 'lost-node-path',
	).length;
	operations.resetHistory();
	expect(
		events.filter(
			(event) =>
				event.type === 'sequence-props-updated' ||
				event.type === 'lost-node-path',
		),
	).toHaveLength(sequenceEventCount);
});

test('splits a JSX sequence at the playhead as an undoable project mutation', async () => {
	const fileName = '/project/src/Composition.tsx';
	const initialContents = `import {Composition, Sequence} from 'remotion';
export const Component = () => <Sequence from={10} durationInFrames={20} />;
export const Root = () => <Composition id="MyComp" component={Component} durationInFrames={60} fps={30} width={1280} height={720} />;`;
	let currentProject: VirtualProject = {
		rootDir: '/project',
		entryPoint: '/project/src/index.tsx',
		files: {
			'/project/src/index.tsx': `import {registerRoot} from 'remotion';
import {Root} from './Composition';
registerRoot(Root);`,
			[fileName]: initialContents,
		},
	};
	const operations = createBrowserStudioOperations({
		dependencyVersions: {},
		getStaticFiles: null,
		getProject: () => currentProject,
		initialElement: null,
		onProjectChange: (nextProject) => {
			currentProject = nextProject;
		},
		resolveDependencies: null,
	});
	const events: EventSourceEvent[] = [];
	operations.subscribeToEvent((event) => events.push(event));

	const subscription = await operations.subscribeToSequenceProps({
		fileName: 'src/Composition.tsx',
		line: 2,
		column: 31,
		nodePath: null,
		componentIdentity: 'dev.remotion.remotion.Sequence',
		keys: ['from', 'durationInFrames'],
		assetKeys: [],
		effects: [],
		clientId: 'browser-studio',
		videoConfigValues: {
			durationInFrames: 60,
			fps: 30,
			height: 720,
			width: 1280,
		},
	});
	if (!subscription.success) {
		throw new Error('Expected sequence props subscription to succeed');
	}

	const failure = await operations.splitJsxSequence({
		fileName: 'src/Composition.tsx',
		nodePath: subscription.nodePath.nodePath,
		sequenceKeys: ['from', 'durationInFrames', 'trimBefore'],
		splitFrame: 10,
	});
	expect(failure).toMatchObject({
		success: false,
		reason: 'Cannot split at or before the sequence start',
		stack: expect.any(String),
	});
	expect(currentProject.files[fileName]).toBe(initialContents);

	const splitResult = await operations.splitJsxSequence({
		fileName: 'src/Composition.tsx',
		nodePath: subscription.nodePath.nodePath,
		sequenceKeys: ['from', 'durationInFrames', 'trimBefore'],
		splitFrame: 15,
	});
	if (!splitResult.success) {
		throw new Error(splitResult.reason);
	}

	expect(currentProject.files[fileName]).toContain(
		'<Sequence from={10} durationInFrames={5} />',
	);
	expect(currentProject.files[fileName]).toContain(
		'<Sequence from={15} durationInFrames={15} trimBefore={5} />',
	);
	expect(
		events.findLast((event) => event.type === 'sequence-node-paths-remapped'),
	).toEqual({
		type: 'sequence-node-paths-remapped',
		mutation: splitResult.nodePathMutation,
	});
	expect(splitResult.nodePathMutation.files).toEqual([
		{
			absolutePath: fileName,
			remappings: expect.any(Array),
		},
	]);

	const undoResult = await operations.undo();
	expect(undoResult.success).toBe(true);
	expect(currentProject.files[fileName]).toBe(initialContents);
	const redoResult = await operations.redo();
	expect(redoResult.success).toBe(true);
	expect(currentProject.files[fileName]).toContain(
		'<Sequence from={15} durationInFrames={15} trimBefore={5} />',
	);
});

const makeOperationsForProject = (project: VirtualProject) => {
	let currentProject = project;
	const operations = createBrowserStudioOperations({
		dependencyVersions: {},
		getStaticFiles: null,
		getProject: () => currentProject,
		initialElement: null,
		onProjectChange: (nextProject) => {
			currentProject = nextProject;
		},
		resolveDependencies: null,
	});
	return {operations, getProject: () => currentProject};
};

test('duplicates a JSX sequence as an undoable project mutation', async () => {
	const fileName = '/project/src/Composition.tsx';
	const initialContents = `import {Composition, Sequence} from 'remotion';

export const Component = () => (
	<>
		<Sequence name="first" from={0} durationInFrames={20} />
		<Sequence name="second" from={20} durationInFrames={20} />
	</>
);
export const Root = () => <Composition id="MyComp" component={Component} durationInFrames={60} fps={30} width={1280} height={720} />;`;
	const {operations, getProject} = makeOperationsForProject({
		rootDir: '/project',
		entryPoint: '/project/src/index.tsx',
		files: {
			'/project/src/index.tsx': `import {registerRoot} from 'remotion';
import {Root} from './Composition';
registerRoot(Root);`,
			[fileName]: initialContents,
		},
	});
	const events: EventSourceEvent[] = [];
	operations.subscribeToEvent((event) => events.push(event));
	const subscription = await operations.subscribeToSequenceProps({
		fileName: 'src/Composition.tsx',
		line: 5,
		column: 2,
		nodePath: null,
		componentIdentity: 'dev.remotion.remotion.Sequence',
		keys: ['from', 'durationInFrames'],
		assetKeys: [],
		effects: [],
		clientId: 'browser-studio',
		videoConfigValues: {
			durationInFrames: 60,
			fps: 30,
			height: 720,
			width: 1280,
		},
	});
	if (!subscription.success) {
		throw new Error('Expected sequence props subscription to succeed');
	}

	const failure = await operations.duplicateJsxNode({
		nodes: [
			{
				fileName: 'src/Composition.tsx',
				nodePath: [...subscription.nodePath.nodePath, 'missing'],
			},
		],
	});
	expect(failure).toMatchObject({
		success: false,
		reason:
			'Could not find a JSX element at the specified location to duplicate',
		stack: expect.any(String),
	});
	expect(getProject().files[fileName]).toBe(initialContents);

	const result = await operations.duplicateJsxNode({
		nodes: [
			{
				fileName: 'src/Composition.tsx',
				nodePath: subscription.nodePath.nodePath,
			},
		],
	});
	if (!result.success) {
		throw new Error(result.reason);
	}

	const output = getProject().files[fileName];
	expect(output.match(/<Sequence/g)).toHaveLength(3);
	expect(output).toContain('name="first-copy"');
	expect(result.nodePathMutation.files).toEqual([
		{
			absolutePath: fileName,
			remappings: expect.any(Array),
		},
	]);
	expect(
		events.findLast((event) => event.type === 'sequence-node-paths-remapped'),
	).toEqual({
		type: 'sequence-node-paths-remapped',
		mutation: result.nodePathMutation,
	});

	expect(await operations.undo()).toMatchObject({success: true});
	expect(getProject().files[fileName]).toBe(initialContents);
	expect(await operations.redo()).toMatchObject({success: true});
	expect(getProject().files[fileName]).toContain('name="first-copy"');
});

test('edits sequence and effect keyframes in the virtual project', async () => {
	const fileName = '/project/src/Comp.tsx';
	const initialContents = `import {tint} from '@remotion/effects/tint';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';

export const Comp = () => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill
			style={{opacity: interpolate(frame, [0, 20], [0, 1])}}
			effects={[tint({amount: interpolate(frame, [0, 20], [0.2, 0.8])})]}
		/>
	);
};
`;
	const effectSchema = {
		amount: {type: 'number', default: 0, hiddenFromList: false},
	} satisfies InteractivitySchema;
	const {operations, getProject} = makeOperationsForProject({
		rootDir: '/project',
		entryPoint: fileName,
		files: {[fileName]: initialContents},
	});
	const subscription = await operations.subscribeToSequenceProps({
		fileName: 'src/Comp.tsx',
		line: 7,
		column: 2,
		nodePath: null,
		componentIdentity: null,
		keys: ['style.opacity'],
		assetKeys: [],
		effects: [['amount']],
		clientId: 'browser-studio',
		videoConfigValues: {
			durationInFrames: 60,
			fps: 30,
			height: 720,
			width: 1280,
		},
	});
	if (!subscription.success) {
		throw new Error('Expected sequence props subscription');
	}

	const failedContents = getProject().files[fileName];
	await expect(
		operations.keyframes.moveKeyframes({
			sequenceKeyframes: [
				{
					fileName: 'src/Comp.tsx',
					nodePath: subscription.nodePath,
					key: 'style.opacity',
					fromFrame: 99,
					toFrame: 10,
					schema: NoReactInternals.sequenceSchema,
				},
			],
			effectKeyframes: [],
			clientId: 'browser-studio',
		}),
	).rejects.toThrow('Cannot move keyframe at frame 99: not found');
	expect(getProject().files[fileName]).toBe(failedContents);

	const sequenceResult = await operations.keyframes.addSequenceKeyframe({
		fileName: 'src/Comp.tsx',
		nodePath: subscription.nodePath,
		key: 'style.opacity',
		frame: 5,
		value: '0.25',
		schema: NoReactInternals.sequenceSchema,
		clientId: 'browser-studio',
	});
	expect(sequenceResult.canUpdate).toBe(true);
	expect(getProject().files[fileName]).toContain(
		'opacity: interpolate(frame, [0, 5, 20], [0, 0.25, 1])',
	);
	const beforeQueuedSave = getProject().files[fileName];
	await operations.saveSequenceProps({
		edits: [],
		captionPatches: [],
		addedKeyframes: [
			{
				fileName: 'src/Comp.tsx',
				nodePath: subscription.nodePath,
				key: 'style.opacity',
				frame: 8,
				value: '0.4',
				schema: NoReactInternals.sequenceSchema,
			},
		],
		movedKeyframes: null,
		clientId: 'browser-studio',
		undoLabel: 'Remove opacity keyframe',
		redoLabel: 'Add opacity keyframe',
	});
	expect(getProject().files[fileName]).toContain(
		'opacity: interpolate(frame, [0, 5, 8, 20], [0, 0.25, 0.4, 1])',
	);
	expect(await operations.undo()).toMatchObject({success: true});
	expect(getProject().files[fileName]).toBe(beforeQueuedSave);

	const effectResult = await operations.keyframes.addEffectKeyframe({
		fileName: 'src/Comp.tsx',
		sequenceNodePath: subscription.nodePath,
		effectIndex: 0,
		key: 'amount',
		frame: 10,
		value: '0.5',
		schema: effectSchema,
		clientId: 'browser-studio',
	});
	expect(effectResult).toMatchObject({canUpdate: true, effectIndex: 0});
	expect(getProject().files[fileName]).toContain(
		'amount: interpolate(frame, [0, 10, 20], [0.2, 0.5, 0.8])',
	);

	await operations.keyframes.moveKeyframes({
		sequenceKeyframes: [
			{
				fileName: 'src/Comp.tsx',
				nodePath: subscription.nodePath,
				key: 'style.opacity',
				fromFrame: 5,
				toFrame: 6,
				schema: NoReactInternals.sequenceSchema,
			},
		],
		effectKeyframes: [
			{
				fileName: 'src/Comp.tsx',
				sequenceNodePath: subscription.nodePath,
				effectIndex: 0,
				key: 'amount',
				fromFrame: 10,
				toFrame: 12,
				schema: effectSchema,
			},
		],
		clientId: 'browser-studio',
	});
	expect(getProject().files[fileName]).toContain('[0, 6, 20], [0, 0.25, 1]');
	expect(getProject().files[fileName]).toContain(
		'[0, 12, 20], [0.2, 0.5, 0.8]',
	);

	await operations.keyframes.batchUpdateKeyframeSettings({
		sequenceKeyframes: [
			{
				fileName: 'src/Comp.tsx',
				nodePath: subscription.nodePath,
				key: 'style.opacity',
				settings: {
					type: 'easing',
					segmentIndex: 0,
					easing: {type: 'bezier', x1: 0.42, y1: 0, x2: 1, y2: 1},
				},
				schema: NoReactInternals.sequenceSchema,
			},
		],
		effectKeyframes: [
			{
				fileName: 'src/Comp.tsx',
				sequenceNodePath: subscription.nodePath,
				effectIndex: 0,
				key: 'amount',
				settings: {
					type: 'easing',
					segmentIndex: 0,
					easing: {type: 'bezier', x1: 0, y1: 0, x2: 0.58, y2: 1},
				},
				schema: effectSchema,
			},
		],
		clientId: 'browser-studio',
	});
	expect(getProject().files[fileName]).toContain(
		'Easing.bezier(0.42, 0, 1, 1)',
	);
	expect(getProject().files[fileName]).toContain(
		'Easing.bezier(0, 0, 0.58, 1)',
	);

	const beforeDelete = getProject().files[fileName];
	await operations.keyframes.deleteKeyframes({
		sequenceKeyframes: [
			{
				fileName: 'src/Comp.tsx',
				nodePath: subscription.nodePath,
				key: 'style.opacity',
				frame: 6,
				schema: NoReactInternals.sequenceSchema,
			},
		],
		effectKeyframes: [
			{
				fileName: 'src/Comp.tsx',
				sequenceNodePath: subscription.nodePath,
				effectIndex: 0,
				key: 'amount',
				frame: 12,
				schema: effectSchema,
			},
		],
		clientId: 'browser-studio',
	});
	expect(getProject().files[fileName]).not.toContain('[0, 6, 20]');
	expect(getProject().files[fileName]).not.toContain('[0, 12, 20]');
	expect(await operations.undo()).toMatchObject({success: true});
	expect(getProject().files[fileName]).toBe(beforeDelete);
});

test('renames a composition by resolving the file from the composition id', async () => {
	const {operations, getProject} = makeOperationsForProject(
		createBlankTemplateProject(),
	);

	const result = await operations.applyCodemod({
		codemod: {
			type: 'rename-composition',
			idToRename: 'MyComp',
			newId: 'RenamedComp',
		},
		dryRun: false,
		symbolicatedStack: null,
	});
	if (!result.success) {
		throw new Error(result.reason);
	}

	expect(getProject().files['/project/src/Composition.tsx']).toContain(
		'id="RenamedComp"',
	);

	const undoResult = await operations.undo();
	expect(undoResult.success).toBe(true);
	expect(getProject().files['/project/src/Composition.tsx']).toContain(
		'id="MyComp"',
	);
});

test('updates composition metadata in Browser Studio', async () => {
	const {operations, getProject} = makeOperationsForProject(
		createBlankTemplateProject(),
	);

	const result = await operations.applyCodemod({
		codemod: {
			type: 'update-composition-metadata',
			idToUpdate: 'MyComp',
			newDurationInFrames: 120,
			newFps: 60,
			newHeight: 1080,
			newWidth: 1920,
		},
		dryRun: false,
		symbolicatedStack: null,
	});
	if (!result.success) {
		throw new Error(result.reason);
	}

	const composition = getProject().files['/project/src/Composition.tsx'];
	expect(composition).toContain('durationInFrames={120}');
	expect(composition).toContain('fps={60}');
	expect(composition).toContain('width={1920}');
	expect(composition).toContain('height={1080}');
});

test('deletes a composition and supports a dry run', async () => {
	const {operations, getProject} = makeOperationsForProject(
		createBlankTemplateProject(),
	);
	const initialContents = getProject().files['/project/src/Composition.tsx'];

	const dryRunResult = await operations.applyCodemod({
		codemod: {type: 'delete-composition', idToDelete: 'MyComp'},
		dryRun: true,
		symbolicatedStack: null,
	});
	if (!dryRunResult.success) {
		throw new Error(dryRunResult.reason);
	}

	expect(dryRunResult.diff.deletions).toBeGreaterThan(0);
	expect(getProject().files['/project/src/Composition.tsx']).toBe(
		initialContents,
	);

	const result = await operations.applyCodemod({
		codemod: {type: 'delete-composition', idToDelete: 'MyComp'},
		dryRun: false,
		symbolicatedStack: null,
	});
	if (!result.success) {
		throw new Error(result.reason);
	}

	expect(getProject().files['/project/src/Composition.tsx']).not.toContain(
		'<Composition',
	);
});

test('creates a composition with a component file in the root file', async () => {
	const {operations, getProject} = makeOperationsForProject(
		createBlankTemplateProject(),
	);

	const codemod = {
		type: 'new-composition' as const,
		newId: 'FreshComp',
		componentName: 'FreshComp',
		componentImportPath: './FreshComp',
		folderName: null,
		parentName: null,
		newHeight: 720,
		newWidth: 1280,
		newFps: 30,
		newDurationInFrames: 90,
		canvasCapture: null,
	};
	const result = await operations.applyCodemod({
		codemod,
		dryRun: false,
		symbolicatedStack: null,
	});
	if (!result.success) {
		throw new Error(result.reason);
	}

	const rootFile = getProject().files['/project/src/Root.tsx'];
	expect(rootFile).toContain('id="FreshComp"');
	expect(rootFile).toContain("import {Composition} from 'remotion'");
	expect(rootFile).toContain("import {FreshComp} from './FreshComp'");
	expect(getProject().files['/project/src/FreshComp.tsx']).toContain(
		'export const FreshComp: React.FC',
	);

	const conflict = await operations.applyCodemod({
		codemod: {...codemod, newId: 'FreshComp2'},
		dryRun: false,
		symbolicatedStack: null,
	});
	expect(conflict).toEqual({
		success: false,
		reason: 'Cannot create src/FreshComp.tsx because it already exists',
	});

	const undoResult = await operations.undo();
	expect(undoResult.success).toBe(true);
	expect(getProject().files['/project/src/FreshComp.tsx']).toBeUndefined();
	expect(getProject().files['/project/src/Root.tsx']).not.toContain(
		'id="FreshComp"',
	);
});

test('creates, renames and deletes a folder in Browser Studio', async () => {
	const {operations, getProject} = makeOperationsForProject(
		createBlankTemplateProject(),
	);

	const createResult = await operations.applyCodemod({
		codemod: {type: 'new-folder', folderName: 'my-folder', parentName: null},
		dryRun: false,
		symbolicatedStack: null,
	});
	if (!createResult.success) {
		throw new Error(createResult.reason);
	}

	const rootFile = getProject().files['/project/src/Root.tsx'];
	expect(rootFile).toContain('<Folder name="my-folder" />');
	expect(rootFile).toContain("import {Folder} from 'remotion'");

	const renameResult = await operations.applyCodemod({
		codemod: {
			type: 'rename-folder',
			folderName: 'my-folder',
			parentName: null,
			newName: 'renamed-folder',
		},
		dryRun: false,
		symbolicatedStack: null,
	});
	if (!renameResult.success) {
		throw new Error(renameResult.reason);
	}

	expect(getProject().files['/project/src/Root.tsx']).toContain(
		'<Folder name="renamed-folder" />',
	);

	const deleteResult = await operations.applyCodemod({
		codemod: {
			type: 'delete-folder',
			folderName: 'renamed-folder',
			parentName: null,
		},
		dryRun: false,
		symbolicatedStack: null,
	});
	if (!deleteResult.success) {
		throw new Error(deleteResult.reason);
	}

	expect(getProject().files['/project/src/Root.tsx']).not.toContain('<Folder');
});

test('moves a composition into a folder using a symbolicated stack', async () => {
	const fileName = '/project/src/Root.tsx';
	const {operations, getProject} = makeOperationsForProject({
		rootDir: '/project',
		entryPoint: '/project/src/index.ts',
		files: {
			'/project/src/index.ts': `import {registerRoot} from 'remotion';
import {Root} from './Root';
registerRoot(Root);
`,
			[fileName]: `import {Composition, Folder} from 'remotion';

const MyComponent = () => null;

export const Root = () => {
	return (
		<>
			<Folder name="target-folder" />
			<Composition id="MyComp" component={MyComponent} durationInFrames={60} fps={30} width={1280} height={720} />
		</>
	);
};
`,
		},
	});

	const result = await operations.applyCodemod({
		codemod: {
			type: 'move-composition-to-folder',
			idToMove: 'MyComp',
			folderName: 'target-folder',
			parentName: null,
		},
		dryRun: false,
		symbolicatedStack: {
			originalFileName: 'src/Root.tsx',
			originalFunctionName: null,
			originalLineNumber: 9,
			originalColumnNumber: 4,
			originalScriptCode: null,
		},
	});
	if (!result.success) {
		throw new Error(result.reason);
	}

	const rootFile = getProject().files[fileName];
	expect(rootFile).toContain('<Folder name="target-folder">');
	expect(rootFile.indexOf('<Composition')).toBeGreaterThan(
		rootFile.indexOf('<Folder'),
	);
});

test('reorders JSX sequences as an undoable project mutation', async () => {
	const fileName = '/project/src/Composition.tsx';
	const initialContents = `import {Composition, Sequence} from 'remotion';

export const Component = () => {
	return (
		<>
			<Sequence name="first" from={0} durationInFrames={20} />
			<Sequence name="second" from={20} durationInFrames={20} />
		</>
	);
};

export const Root = () => <Composition id="MyComp" component={Component} durationInFrames={60} fps={30} width={1280} height={720} />;
`;
	const {operations, getProject} = makeOperationsForProject({
		rootDir: '/project',
		entryPoint: '/project/src/index.tsx',
		files: {
			'/project/src/index.tsx': `import {registerRoot} from 'remotion';
import {Root} from './Composition';
registerRoot(Root);`,
			[fileName]: initialContents,
		},
	});
	const events: EventSourceEvent[] = [];
	operations.subscribeToEvent((event) => events.push(event));

	const subscribeAtLine = async (line: number) => {
		const subscription = await operations.subscribeToSequenceProps({
			fileName: 'src/Composition.tsx',
			line,
			column: 3,
			nodePath: null,
			componentIdentity: 'dev.remotion.remotion.Sequence',
			keys: ['from', 'durationInFrames'],
			assetKeys: [],
			effects: [],
			clientId: 'browser-studio',
			videoConfigValues: {
				durationInFrames: 60,
				fps: 30,
				height: 720,
				width: 1280,
			},
		});
		if (!subscription.success) {
			throw new Error('Expected sequence props subscription to succeed');
		}

		return subscription.nodePath;
	};

	const firstNodePath = await subscribeAtLine(6);
	const secondNodePath = await subscribeAtLine(7);

	const identicalFailure = await operations.reorderSequence({
		fileName: 'src/Composition.tsx',
		sourceNodePath: firstNodePath,
		targetNodePath: firstNodePath,
		position: 'after',
		clientId: 'browser-studio',
	});
	expect(identicalFailure).toMatchObject({
		success: false,
		reason: 'Cannot reorder sequence: source and target are identical',
		stack: expect.any(String),
	});
	expect(getProject().files[fileName]).toBe(initialContents);

	const result = await operations.reorderSequence({
		fileName: 'src/Composition.tsx',
		sourceNodePath: firstNodePath,
		targetNodePath: secondNodePath,
		position: 'after',
		clientId: 'browser-studio',
	});
	if (!result.success) {
		throw new Error(result.reason);
	}

	const reordered = getProject().files[fileName];
	expect(reordered.indexOf('name="second"')).toBeLessThan(
		reordered.indexOf('name="first"'),
	);
	expect(result.nodePathMutation.files).toEqual([
		{
			absolutePath: fileName,
			remappings: expect.any(Array),
		},
	]);
	expect(
		events.findLast((event) => event.type === 'sequence-node-paths-remapped'),
	).toEqual({
		type: 'sequence-node-paths-remapped',
		mutation: result.nodePathMutation,
	});

	const undoResult = await operations.undo();
	expect(undoResult.success).toBe(true);
	expect(getProject().files[fileName]).toBe(initialContents);
});

test('updates default props in the virtual project', async () => {
	const fileName = '/project/src/Root.tsx';
	const {operations, getProject} = makeOperationsForProject({
		rootDir: '/project',
		entryPoint: '/project/src/index.ts',
		files: {
			'/project/src/index.ts': `import {registerRoot} from 'remotion';
import {Root} from './Root';
registerRoot(Root);
`,
			[fileName]: `import {Composition} from 'remotion';

const MyComponent = (props: {title: string; count: number}) => null;

export const Root = () => {
	return (
		<Composition
			id="MyComp"
			component={MyComponent}
			durationInFrames={60}
			fps={30}
			width={1280}
			height={720}
			defaultProps={{title: 'Hello', count: 1}}
		/>
	);
};
`,
		},
	});
	const events: EventSourceEvent[] = [];
	operations.subscribeToEvent((event) => events.push(event));
	await operations.subscribeToDefaultProps({
		clientId: 'browser-studio',
		compositionId: 'MyComp',
	});

	const result = await operations.updateDefaultProps({
		compositionId: 'MyComp',
		defaultProps: JSON.stringify({title: 'Updated', count: 2}),
		enumPaths: [],
	});
	expect(result).toEqual({success: true});
	expect(getProject().files[fileName]).toContain(
		`defaultProps={{title: 'Updated', count: 2}}`,
	);
	expect(
		events.some((event) => event.type === 'default-props-updatable-changed'),
	).toBe(true);

	const undoResult = await operations.undo();
	expect(undoResult.success).toBe(true);
	expect(getProject().files[fileName]).toContain(
		`defaultProps={{title: 'Hello', count: 1}}`,
	);

	const missingDefaultProps = await operations.updateDefaultProps({
		compositionId: 'Unknown',
		defaultProps: JSON.stringify({}),
		enumPaths: [],
	});
	expect(missingDefaultProps).toEqual({
		success: false,
		reason: 'Could not find composition "Unknown"',
		stack: expect.any(String),
	});
});

test('formats wrapped default props with spaces', async () => {
	const fileName = '/project/src/Root.tsx';
	const {operations, getProject} = makeOperationsForProject({
		rootDir: '/project',
		entryPoint: '/project/src/index.ts',
		files: {
			'/project/src/index.ts': `import {registerRoot} from 'remotion';
import {Root} from './Root';
registerRoot(Root);
`,
			[fileName]: `import {Composition} from 'remotion';

const MyComponent = () => null;

export const Root = () => (
  <Composition
    id="MyComp"
    component={MyComponent}
    durationInFrames={60}
    fps={30}
    width={1280}
    height={720}
    defaultProps={{title: 'Before'}}
  />
);
`,
		},
	});

	const result = await operations.updateDefaultProps({
		compositionId: 'MyComp',
		defaultProps: JSON.stringify({
			title: 'A sufficiently long title to wrap the default props object',
			count: 2,
		}),
		enumPaths: [],
	});

	expect(result).toEqual({success: true});
	expect(getProject().files[fileName]).toContain(`defaultProps={{
      title: 'A sufficiently long title to wrap the default props object',
      count: 2,
    }}`);
	expect(getProject().files[fileName]).not.toContain('\t');
});

test('reports a structured error when a composition has no defaultProps', async () => {
	const {operations, getProject} = makeOperationsForProject(
		createBlankTemplateProject(),
	);
	const initialFiles = {...getProject().files};

	const result = await operations.updateDefaultProps({
		compositionId: 'MyComp',
		defaultProps: JSON.stringify({title: 'Hello'}),
		enumPaths: [],
	});
	expect(result).toEqual({
		success: false,
		reason:
			'No `defaultProps` prop found in the <Composition/> tag with the ID "MyComp".',
		stack: expect.any(String),
	});
	expect(getProject().files).toEqual(initialFiles);
});

test('reports structured failures for unsupported codemods', async () => {
	const {operations, getProject} = makeOperationsForProject(
		createBlankTemplateProject(),
	);
	const initialFiles = {...getProject().files};

	expect(
		await operations.applyCodemod({
			codemod: {type: 'apply-visual-control', changes: []},
			dryRun: false,
			symbolicatedStack: null,
		}),
	).toEqual({
		success: false,
		reason: 'Applying visual controls is not supported in Browser Studio',
	});

	expect(
		await operations.applyCodemod({
			codemod: {
				type: 'new-composition',
				newId: 'CanvasComp',
				componentName: 'CanvasComp',
				componentImportPath: './CanvasComp',
				folderName: null,
				parentName: null,
				newHeight: 720,
				newWidth: 1280,
				newFps: 30,
				newDurationInFrames: 90,
				canvasCapture: {
					videoFileName: 'video.mp4',
					videoHeight: 720,
					videoWidth: 1280,
					keyframeFps: 30,
					data: {version: 1, tracks: []} as never,
				},
			},
			dryRun: false,
			symbolicatedStack: null,
		}),
	).toEqual({
		success: false,
		reason:
			'Creating canvas capture compositions is not supported in Browser Studio',
	});

	expect(
		await operations.applyCodemod({
			codemod: {type: 'delete-composition', idToDelete: 'MissingComp'},
			dryRun: false,
			symbolicatedStack: null,
		}),
	).toEqual({
		success: false,
		reason: 'Could not find composition "MissingComp"',
	});

	expect(getProject().files).toEqual(initialFiles);
});

test('mutates effects in the virtual project and reports structured failures', async () => {
	const fileName = '/project/src/Comp.tsx';
	const initialContents = `import {brightness} from '@remotion/effects/brightness';
import {contrast} from '@remotion/effects/contrast';
import {AbsoluteFill} from 'remotion';

export const Comp = () => (
	<AbsoluteFill effects={[brightness({amount: 1}), contrast({amount: 2})]} />
);
`;
	let currentProject: VirtualProject = {
		rootDir: '/project',
		entryPoint: fileName,
		files: {
			[fileName]: initialContents,
			'/project/package.json': '{"dependencies": {}}',
		},
	};
	let projectChanges = 0;
	const operations = createBrowserStudioOperations({
		dependencyVersions: {remotion: '4.0.514'},
		getStaticFiles: null,
		getProject: () => currentProject,
		initialElement: null,
		onProjectChange: (project) => {
			projectChanges++;
			currentProject = project;
		},
		resolveDependencies: null,
	});
	const subscription = await operations.subscribeToSequenceProps({
		fileName: 'src/Comp.tsx',
		line: 6,
		column: 2,
		nodePath: null,
		componentIdentity: null,
		keys: [],
		assetKeys: [],
		effects: [['amount'], ['amount']],
		clientId: 'browser-studio',
		videoConfigValues: {
			durationInFrames: 60,
			fps: 30,
			height: 720,
			width: 1280,
		},
	});
	if (!subscription.success) {
		throw new Error('Expected sequence props subscription');
	}

	const {effects} = operations;
	const addResult = await effects.addEffect({
		fileName: 'src/Comp.tsx',
		sequenceNodePath: subscription.nodePath,
		effectName: 'tint',
		effectImportPath: '@remotion/effects/tint',
		effectConfig: {color: 'red'},
		clientId: 'browser-studio',
	});
	expect(addResult).toEqual({success: true});
	expect(currentProject.files[fileName]).toContain('tint({');
	expect(currentProject.files['/project/package.json']).toContain(
		'"@remotion/effects": "4.0.514"',
	);

	expect(
		await effects.duplicateEffects([
			{
				fileName: 'src/Comp.tsx',
				sequenceNodePath: subscription.nodePath,
				effectIndex: 0,
			},
		]),
	).toEqual({success: true});
	expect(currentProject.files[fileName].match(/brightness\(\{/g)).toHaveLength(
		2,
	);

	expect(
		await effects.reorderEffect({
			fileName: 'src/Comp.tsx',
			sequenceNodePath: subscription.nodePath,
			fromIndex: 3,
			toIndex: 0,
			clientId: 'browser-studio',
		}),
	).toEqual({success: true});
	expect(currentProject.files[fileName].indexOf('tint({')).toBeLessThan(
		currentProject.files[fileName].indexOf('brightness({'),
	);

	const effectSchema = {
		amount: {type: 'number', default: 1, hiddenFromList: false},
	} satisfies InteractivitySchema;
	const editResult = await effects.saveEffectProps({
		type: 'value',
		fileName: 'src/Comp.tsx',
		sequenceNodePath: subscription.nodePath,
		effectIndex: 1,
		key: 'amount',
		value: '0.5',
		defaultValue: '1',
		schema: effectSchema,
		clientId: 'browser-studio',
	});
	expect(editResult).toMatchObject({
		canUpdate: true,
		effectIndex: 1,
		props: {amount: {status: 'static', codeValue: 0.5}},
	});
	expect(currentProject.files[fileName]).toContain('amount: 0.5');

	const multipleEditResult = await effects.saveMultipleEffectProps({
		edits: [
			{
				type: 'value',
				fileName: 'src/Comp.tsx',
				sequenceNodePath: subscription.nodePath,
				effectIndex: 2,
				key: 'amount',
				value: '0.25',
				defaultValue: '1',
				schema: effectSchema,
			},
		],
		clientId: 'browser-studio',
		undoLabel: 'Undo effect edits',
		redoLabel: 'Redo effect edits',
	});
	expect(multipleEditResult.results[0]?.status).toMatchObject({
		canUpdate: true,
		props: {amount: {status: 'static', codeValue: 0.25}},
	});

	expect(
		await effects.pasteEffects({
			targetFileName: 'src/Comp.tsx',
			targetSequenceNodePath: subscription.nodePath,
			type: 'effects-additive',
			effects: [
				{
					callee: 'blur',
					importPath: '@remotion/effects/blur',
					params: {radius: {type: 'static', value: 12}},
				},
			],
			clientId: 'browser-studio',
			insertAtIndices: null,
		}),
	).toEqual({success: true});
	expect(currentProject.files[fileName]).toContain('blur({');

	const beforeDelete = currentProject.files[fileName];
	expect(
		await effects.deleteEffects([
			{
				type: 'single-effect',
				fileName: 'src/Comp.tsx',
				sequenceNodePath: subscription.nodePath,
				effectIndex: 0,
			},
		]),
	).toEqual({success: true});
	expect(currentProject.files[fileName].indexOf('tint({')).toBe(-1);
	expect(await operations.undo()).toMatchObject({success: true});
	expect(currentProject.files[fileName]).toBe(beforeDelete);
	expect(await operations.redo()).toMatchObject({success: true});
	expect(currentProject.files[fileName].indexOf('tint({')).toBe(-1);
	expect(projectChanges).toBeGreaterThanOrEqual(9);

	const beforeFailures = currentProject.files[fileName];
	expect(
		await effects.duplicateEffects([
			{
				fileName: 'src/Comp.tsx',
				sequenceNodePath: subscription.nodePath,
				effectIndex: 99,
			},
		]),
	).toEqual({
		success: false,
		reason: 'Cannot duplicate effect: not-found',
		stack: expect.any(String),
	});
	expect(
		await effects.addEffect({
			fileName: 'src/Comp.tsx',
			sequenceNodePath: subscription.nodePath,
			effectName: 'unsafe',
			effectImportPath: 'untrusted-package',
			effectConfig: {},
			clientId: 'browser-studio',
		}),
	).toEqual({
		success: false,
		reason: 'Unsupported effect import "untrusted-package"',
		stack: expect.any(String),
	});
	expect(
		await effects.pasteEffects({
			targetFileName: 'src/Comp.tsx',
			targetSequenceNodePath: subscription.nodePath,
			type: 'effects-additive',
			effects: [
				{
					callee: 'blur',
					importPath: '@remotion/effects/blur',
					params: {},
				},
			],
			clientId: 'browser-studio',
			insertAtIndices: [0, 1],
		}),
	).toEqual({
		success: false,
		reason: 'Cannot paste effects: invalid insertion indices',
		stack: expect.any(String),
	});
	expect(currentProject.files[fileName]).toBe(beforeFailures);
});
