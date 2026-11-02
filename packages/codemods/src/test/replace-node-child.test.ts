import {expect, test} from 'bun:test';
import {createElement, staticFileValue} from '../codemod-element';
import {CodemodsInternals} from '../index';
import {replaceNodeChild} from '../replace-node-child';
import {lineContainingToNodePath} from './node-path-test-utils';

const video = createElement({
	component: 'Video',
	importPath: '@remotion/media',
	props: {src: staticFileValue('prerendered/Catalog.mp4')},
});

test('replaceNodeChild swaps a scene for a video and updates imports', () => {
	const input = `import {TransitionSeries} from '@remotion/transitions';
import {AbsoluteFill} from 'remotion';
import {Catalog} from './scenes/Catalog';

export const Main = () => {
	return (
		<AbsoluteFill>
			<TransitionSeries>
				<TransitionSeries.Sequence name="Catalog" durationInFrames={90}>
					<Catalog />
				</TransitionSeries.Sequence>
			</TransitionSeries>
		</AbsoluteFill>
	);
};
`;
	const result = replaceNodeChild({
		project: {rootDir: '/', files: {'/test.tsx': input}},
		node: {
			filePath: '/test.tsx',
			nodePath: lineContainingToNodePath(input, '<TransitionSeries.Sequence'),
		},
		element: video,
	});

	expect(result.changes[0].nextContents)
		.toBe(`import {Video} from '@remotion/media';
import {TransitionSeries} from '@remotion/transitions';
import {AbsoluteFill, staticFile} from 'remotion';

export const Main = () => {
	return (
		<AbsoluteFill>
			<TransitionSeries>
				<TransitionSeries.Sequence name="Catalog" durationInFrames={90}>
					<Video src={staticFile('prerendered/Catalog.mp4')} />
				</TransitionSeries.Sequence>
			</TransitionSeries>
		</AbsoluteFill>
	);
};
`);
	expect(result.logLine).toBe(10);
});

test('replaceNodeChild rejects nodes with more than one child', () => {
	const input = `import {Sequence} from 'remotion';

export const Main = () => (
	<Sequence>
		<A />
		<B />
	</Sequence>
);
`;
	expect(() =>
		replaceNodeChild({
			project: {rootDir: '/', files: {'/test.tsx': input}},
			node: {
				filePath: '/test.tsx',
				nodePath: lineContainingToNodePath(input, '<Sequence>'),
			},
			element: video,
		}),
	).toThrow('The target element must have exactly one JSX child');
});

test('replaceJsxElementWithSource restores a pre-rendered scene', () => {
	const input = `import {Sequence} from 'remotion';
import {Catalog, ITEMS} from './scenes/Catalog';

export const Main = () => (
	<Sequence>
		<Catalog
			title="Hi"
			items={ITEMS}
		/>
	</Sequence>
);
`;
	const replaced = replaceNodeChild({
		project: {rootDir: '/', files: {'/test.tsx': input}},
		node: {
			filePath: '/test.tsx',
			nodePath: lineContainingToNodePath(input, '<Sequence>'),
		},
		element: video,
	});
	expect(replaced.replacedSource).toBe(`<Catalog
	title="Hi"
	items={ITEMS}
/>`);
	expect(replaced.replacedImports).toEqual([
		"import {Catalog, ITEMS} from './scenes/Catalog';",
	]);
	expect(replaced.sceneImportSource).toBe('./scenes/Catalog');
	const swapped = replaced.changes[0].nextContents ?? '';
	expect(swapped).not.toContain('./scenes/Catalog');

	const restored = CodemodsInternals.replaceJsxElementWithSource({
		project: {rootDir: '/', files: {'/test.tsx': swapped}},
		node: {
			filePath: '/test.tsx',
			nodePath: lineContainingToNodePath(swapped, '<Video'),
		},
		source: replaced.replacedSource,
		importStatements: replaced.replacedImports,
	});
	expect(restored.changes[0].nextContents).toBe(input);
	expect(restored.nodePathRemappings.length).toBeGreaterThan(0);
});

test('replaceJsxElementWithSource re-adds a namespace import that was split off', () => {
	const input = `import Foo, * as Layout from './pkg';
import {Sequence} from 'remotion';

export const Other = () => <Foo />;

export const Main = () => (
	<Sequence>
		<Layout.Box>
			<Foo />
		</Layout.Box>
	</Sequence>
);
`;
	const replaced = replaceNodeChild({
		project: {rootDir: '/', files: {'/test.tsx': input}},
		node: {
			filePath: '/test.tsx',
			nodePath: lineContainingToNodePath(input, '<Sequence>'),
		},
		element: video,
	});
	const swapped = replaced.changes[0].nextContents ?? '';
	expect(swapped).toContain("import Foo from './pkg';");

	const restored = CodemodsInternals.replaceJsxElementWithSource({
		project: {rootDir: '/', files: {'/test.tsx': swapped}},
		node: {
			filePath: '/test.tsx',
			nodePath: lineContainingToNodePath(swapped, '<Video'),
		},
		source: replaced.replacedSource,
		importStatements: replaced.replacedImports,
	});
	expect(restored.changes[0].nextContents).toBe(`import Foo from './pkg';
import {Sequence} from 'remotion';
import * as Layout from './pkg';

export const Other = () => <Foo />;

export const Main = () => (
	<Sequence>
		<Layout.Box>
			<Foo />
		</Layout.Box>
	</Sequence>
);
`);
});

test('replaceJsxElementWithSource keeps a default import that clashes with an existing one', () => {
	const input = `import Bar, {C} from './pkg';
import {Video} from '@remotion/media';
import {Sequence, staticFile} from 'remotion';

export const Main = () => (
	<Sequence>
		<Bar c={C} />
		<Video src={staticFile('a.webm')} />
	</Sequence>
);
`;
	const restored = CodemodsInternals.replaceJsxElementWithSource({
		project: {rootDir: '/', files: {'/test.tsx': input}},
		node: {
			filePath: '/test.tsx',
			nodePath: lineContainingToNodePath(input, '<Video'),
		},
		source: '<Foo a={A} />',
		importStatements: ["import Foo, {A} from './pkg';"],
	});
	expect(restored.changes[0].nextContents)
		.toBe(`import Bar, {C, A} from './pkg';
import {Sequence} from 'remotion';
import Foo from './pkg';

export const Main = () => (
	<Sequence>
		<Bar c={C} />
		<Foo a={A} />
	</Sequence>
);
`);
});
