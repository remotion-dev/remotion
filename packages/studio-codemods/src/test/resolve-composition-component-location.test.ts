import {expect, test} from 'bun:test';
import {
	resolveCompositionComponentInProject,
	resolveCompositionComponentLocation,
} from '../resolve-composition-component-location';

test('resolves a composition component from source map contents', () => {
	const project = {
		rootDir: '.',
		files: {
			'./src/Root.tsx': [
				"import {Composition} from 'remotion';",
				"import {WidthHeightSequences} from './Sequence/WidthHeightSequences';",
				'export const Root = () => (',
				'  <Composition',
				'    id="WidthHeight"',
				'    component={WidthHeightSequences}',
				'    durationInFrames={120}',
				'    fps={30}',
				'    width={1080}',
				'    height={1080}',
				'  />',
				');',
			].join('\n'),
			'./src/Sequence/WidthHeightSequences.tsx': [
				"import {Sequence} from 'remotion';",
				'',
				'export const WidthHeightSequences = () => {',
				'  return <Sequence />;',
				'};',
			].join('\n'),
		},
	};
	const location = resolveCompositionComponentLocation({
		compositionFile: './src/Root.tsx',
		compositionId: 'WidthHeight',
		project,
	});

	expect(location).toEqual({
		column: 13,
		line: 3,
		source: 'src/Sequence/WidthHeightSequences.tsx',
	});

	const resolved = resolveCompositionComponentInProject({
		compositionFile: './src/Root.tsx',
		compositionId: 'WidthHeight',
		project,
	});
	expect({
		canAddSequence: resolved.canAddSequence,
		exportName: resolved.exportName,
		filePath: resolved.filePath,
		location: resolved.location,
		source: resolved.source,
	}).toEqual({
		canAddSequence: true,
		exportName: 'WidthHeightSequences',
		filePath: './src/Sequence/WidthHeightSequences.tsx',
		location,
		source: project.files['./src/Sequence/WidthHeightSequences.tsx'],
	});
});

test('preserves default exports when resolving a named declaration', () => {
	const project = {
		rootDir: '.',
		files: {
			'./src/Root.tsx': [
				"import {Composition} from 'remotion';",
				"import Video from './Video';",
				'export const Root = () => <Composition id="Video" component={Video} />;',
			].join('\n'),
			'./src/Video.tsx': [
				'const Video = () => <div />;',
				'export default Video;',
			].join('\n'),
		},
	};
	const resolved = resolveCompositionComponentInProject({
		compositionFile: './src/Root.tsx',
		compositionId: 'Video',
		project,
	});

	expect(resolved.exportName).toBe('default');
	expect(resolved.filePath).toBe('./src/Video.tsx');
	expect(resolved.canAddSequence).toBe(true);
});
