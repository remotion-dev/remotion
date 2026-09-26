import {expect, test} from 'bun:test';
import {getNodes} from '../index';

test('lists JSX nodes with their deletion paths in source order', () => {
	const elements = getNodes({
		filePath: 'Video.tsx',
		project: {
			rootDir: '/',
			files: {
				'Video.tsx': `export const Video = () => (
  <AbsoluteFill>
    <Sequence name="Intro" />
    <Series.Sequence durationInFrames={30} />
  </AbsoluteFill>
);`,
			},
		},
	});

	expect(elements.map(({tagName}) => tagName)).toEqual([
		'AbsoluteFill',
		'Sequence',
		'Series.Sequence',
	]);
	expect(elements.every(({nodePath}) => nodePath.length > 0)).toBe(true);
});
