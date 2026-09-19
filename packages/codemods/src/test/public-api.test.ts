import {expect, test} from 'bun:test';
import {addSolid, deleteJsxNode} from '../index';

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
	},
});

test('addSolid() immutably updates a virtual project', () => {
	const project = makeProject();
	const result = addSolid({
		compositionFile: 'src/Root.tsx',
		compositionId: 'Demo',
		height: 720,
		project,
		width: 1280,
	});

	expect(result.project.entryPoint).toBe('src/index.ts');
	expect(result.project).not.toBe(project);
	expect(project.files['src/Video.tsx']).not.toContain('<Solid');
	expect(result.project.files['src/Video.tsx']).toContain(
		'<Solid width={1280} height={720}',
	);
	expect(result.insertedNode.filePath).toBe('src/Video.tsx');
	expect(result.insertedNode.nodePath.length).toBeGreaterThan(0);
	expect(result.changes).toEqual([
		{
			filePath: 'src/Video.tsx',
			previousContents: project.files['src/Video.tsx'],
			nextContents: result.project.files['src/Video.tsx'],
		},
	]);
});

test('deleteJsxNode() deletes the Sequence wrapper identified by a node path', async () => {
	const project = makeProject();
	const added = addSolid({
		compositionFile: 'src/Root.tsx',
		compositionId: 'Demo',
		from: 10,
		height: 720,
		project,
		width: 1280,
	});
	const sourceWithSolid = added.project.files['src/Video.tsx'];
	expect(sourceWithSolid).toContain('<Sequence from={10}');
	const result = await deleteJsxNode({
		filePath: `/${added.insertedNode.filePath}`,
		nodePath: added.insertedNode.nodePath,
		project: added.project,
	});

	expect(result.project.entryPoint).toBe('src/index.ts');
	expect(result.project).not.toBe(added.project);
	expect(added.project.files['src/Video.tsx']).toContain('<Solid');
	expect(result.project.files['src/Video.tsx']).not.toContain('<Solid');
	expect(result.changes).toEqual([
		{
			filePath: 'src/Video.tsx',
			previousContents: sourceWithSolid,
			nextContents: result.project.files['src/Video.tsx'],
		},
	]);
});
