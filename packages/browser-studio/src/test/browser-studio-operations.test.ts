import {expect, test} from 'bun:test';
import type {EventSourceEvent} from '@remotion/studio-shared';
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
	expect(nodePathRemappings).toHaveLength(1);
	expect(nodePathRemappings[0].newNodePath).not.toEqual(
		nodePathRemappings[0].oldNodePath,
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
			remappings: [
				{
					oldNodePath: subscription.nodePath.nodePath,
					newNodePath: expect.any(Array),
				},
			],
			restoredNodePaths: [],
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
			restoredNodePaths: [],
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
		onProjectChange: (nextProject) => {
			currentProject = nextProject;
		},
		resolveDependencies: null,
	});
	return {operations, getProject: () => currentProject};
};

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
