import {expect, test} from 'bun:test';
import type {EventSourceEvent} from '@remotion/studio-shared';
import {
	createBrowserStudioOperations,
	insertSolidIntoProject,
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
	expect(result).toEqual({success: true});
	expect(currentProject.files['/project/src/MyComponent.tsx']).toContain(
		'<Solid width={1280}',
	);
});

test('wraps a self-closing root and aliases conflicting bindings', () => {
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
	const updated = insertSolid(project, '/project/src/index.tsx');
	const output = updated.files['/project/src/index.tsx'];

	expect(output).toContain(
		"import {AbsoluteFill, Composition, registerRoot, Solid as RemotionSolid, Sequence as RemotionSequence} from 'remotion';",
	);
	expect(output).toContain('<RemotionSequence>');
	expect(output).toContain('<RemotionSolid width={1280}');
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
		from: {status: 'static', codeValue: 10},
		durationInFrames: {status: 'static', codeValue: 20},
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

	expect(update.result.props.from).toEqual({status: 'static', codeValue: 15});
	expect(await operations.undo()).toEqual({success: true});
	expect(currentProject.files[fileName]).toContain('from={10}');
	expect(await operations.redo()).toEqual({success: true});
	expect(currentProject.files[fileName]).toContain('from={15}');

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
