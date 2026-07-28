import {expect, test} from 'bun:test';
import {
	createBrowserStudioServer,
	insertSolidIntoProject,
} from '../browser-studio-server';
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

	expect(composition).toContain("import {Solid} from 'remotion';");
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

	expect(composition.match(/import \{Solid\} from 'remotion';/g)).toHaveLength(
		1,
	);
	expect(composition.match(/<Solid /g)).toHaveLength(2);
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
	const server = createBrowserStudioServer({
		getProject: () => currentProject,
		onProjectChange: (nextProject) => {
			currentProject = nextProject;
		},
	});
	expect(server.getCompositionFile('MyComp')).toBe('src/index.tsx');
	expect(server.getCompositionFile('Unknown')).toBeNull();

	const info = await server.callApi('/api/composition-component-info', {
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
		"import {Solid as RemotionSolid, Sequence as RemotionSequence} from 'remotion';",
	);
	expect(output).toContain('<RemotionSequence>');
	expect(output).toContain('<RemotionSolid width={1280}');
});
