import {expect, test} from 'bun:test';
import {addSolid} from '../public';

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
	expect(result.changes).toEqual([
		{
			filePath: 'src/Video.tsx',
			previousContents: project.files['src/Video.tsx'],
			nextContents: result.project.files['src/Video.tsx'],
		},
	]);
});
