import {expect, test} from 'bun:test';
import {resolveCompositionComponentLocation} from '../resolve-composition-component-location';

test('resolves a composition component from source map contents', () => {
	const location = resolveCompositionComponentLocation({
		compositionFile: './src/Root.tsx',
		compositionId: 'WidthHeight',
		project: {
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
		},
	});

	expect(location).toEqual({
		column: 13,
		line: 3,
		source: 'src/Sequence/WidthHeightSequences.tsx',
	});
});
