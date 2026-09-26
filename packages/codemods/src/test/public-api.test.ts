import {expect, test} from 'bun:test';
import {
	addElement,
	applyCodemodChanges,
	createElement,
	deleteNodes,
	type CodemodProject,
} from '../index';

const solid = createElement({
	component: 'Solid',
	importPath: 'remotion',
	props: {width: 1280, height: 720, color: 'gray'},
});

const addSolid = ({
	project,
	compositionFile,
	compositionId,
	from,
}: {
	project: CodemodProject;
	compositionFile: string;
	compositionId: string;
	from?: number;
}) =>
	addElement({
		project,
		element:
			from === undefined
				? solid
				: createElement({
						component: 'Sequence',
						importPath: 'remotion',
						props: {from},
						children: [solid],
					}),
		target: {type: 'composition', compositionFile, compositionId},
	});

const makeProject = () => ({
	entryPoint: 'src/index.ts',
	rootDir: '/',
	files: {
		'src/index.ts': `import {registerRoot} from 'remotion';
import {Root} from './Root';
registerRoot(Root);
`,
		'src/Root.tsx': `import {Composition} from 'remotion';
import {Video} from './Video';
export const Root = () => <Composition id="Demo" component={Video} width={1280} height={720} fps={30} durationInFrames={90} />;
`,
		'src/Video.tsx': `import {AbsoluteFill} from 'remotion';
export const Video = () => <AbsoluteFill>Existing</AbsoluteFill>;
`,
		'src/Root2.tsx': `import {Composition} from 'remotion';
import {Video2} from './Video2';
export const Root2 = () => <Composition id="Demo2" component={Video2} width={1280} height={720} fps={30} durationInFrames={90} />;
`,
		'src/Video2.tsx': `import {AbsoluteFill} from 'remotion';
export const Video2 = () => <AbsoluteFill>Existing</AbsoluteFill>;
`,
	},
});

test('addElement() immutably updates a virtual project', () => {
	const project = makeProject();
	const result = addSolid({
		compositionFile: 'src/Root.tsx',
		compositionId: 'Demo',
		project,
	});
	const updated = applyCodemodChanges(project, result.changes);

	expect(updated.entryPoint).toBe('src/index.ts');
	expect(updated).not.toBe(project);
	expect(project.files['src/Video.tsx']).not.toContain('<Solid');
	expect(updated.files['src/Video.tsx']).toContain(
		'<Solid width={1280} height={720}',
	);
	expect(result.insertedNode.filePath).toBe('src/Video.tsx');
	expect(result.insertedNode.nodePath.length).toBeGreaterThan(0);
	expect(result.changes).toEqual([
		{
			filePath: 'src/Video.tsx',
			previousContents: project.files['src/Video.tsx'],
			nextContents: updated.files['src/Video.tsx'],
		},
	]);
});

test('deleteNodes() deletes nodes from multiple files', async () => {
	const project = makeProject();
	const first = addSolid({
		compositionFile: 'src/Root.tsx',
		compositionId: 'Demo',
		project,
	});
	const afterFirst = applyCodemodChanges(project, first.changes);
	const second = addSolid({
		compositionFile: 'src/Root2.tsx',
		compositionId: 'Demo2',
		project: afterFirst,
	});
	const afterSecond = applyCodemodChanges(afterFirst, second.changes);
	const result = await deleteNodes({
		nodes: [first.insertedNode, second.insertedNode],
		project: afterSecond,
	});
	const updated = applyCodemodChanges(afterSecond, result.changes);

	expect(updated.files['src/Video.tsx']).not.toContain('<Solid');
	expect(updated.files['src/Video2.tsx']).not.toContain('<Solid');
	expect(result.changes.map((change) => change.filePath)).toEqual([
		'src/Video.tsx',
		'src/Video2.tsx',
	]);
});

test('deleteNodes() deletes the Sequence wrapper identified by a node path', async () => {
	const project = makeProject();
	const added = addSolid({
		compositionFile: 'src/Root.tsx',
		compositionId: 'Demo',
		from: 10,
		project,
	});
	const afterAdd = applyCodemodChanges(project, added.changes);
	const sourceWithSolid = afterAdd.files['src/Video.tsx'];
	expect(sourceWithSolid).toContain('<Sequence from={10}');
	const result = await deleteNodes({
		nodes: [
			{
				filePath: `/${added.insertedNode.filePath}`,
				nodePath: added.insertedNode.nodePath,
			},
		],
		project: afterAdd,
	});
	const updated = applyCodemodChanges(afterAdd, result.changes);

	expect(updated.entryPoint).toBe('src/index.ts');
	expect(updated).not.toBe(afterAdd);
	expect(afterAdd.files['src/Video.tsx']).toContain('<Solid');
	expect(updated.files['src/Video.tsx']).not.toContain('<Solid');
	expect(result.changes).toEqual([
		{
			filePath: 'src/Video.tsx',
			previousContents: sourceWithSolid,
			nextContents: updated.files['src/Video.tsx'],
		},
	]);
});

test('applyCodemodChanges checks every file before applying a transaction', () => {
	const project: CodemodProject & {entryPoint: string} = makeProject();
	const changes = [
		{
			filePath: 'src/Video.tsx',
			previousContents: project.files['src/Video.tsx'],
			nextContents: 'updated video',
		},
		{
			filePath: 'src/New.tsx',
			previousContents: null,
			nextContents: 'new component',
		},
	];
	const updated = applyCodemodChanges(project, changes);
	expect(updated.files['src/Video.tsx']).toBe('updated video');
	expect(updated.files['src/New.tsx']).toBe('new component');
	expect(project.files['src/New.tsx']).toBeUndefined();

	const undo = changes.map((change) => ({
		...change,
		previousContents: change.nextContents,
		nextContents: change.previousContents,
	}));
	expect(applyCodemodChanges(updated, undo).files).toEqual(project.files);

	expect(() =>
		applyCodemodChanges(project, [
			changes[0],
			{...changes[1], previousContents: 'stale'},
		]),
	).toThrow('Source changed before applying codemod: src/New.tsx');
	expect(project.files['src/Video.tsx']).not.toBe('updated video');
});
