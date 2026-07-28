import {expect, test} from 'bun:test';
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
