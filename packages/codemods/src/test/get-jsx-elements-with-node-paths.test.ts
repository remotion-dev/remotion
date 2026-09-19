import {expect, test} from 'bun:test';
import {getJsxElementsWithNodePaths} from '../get-jsx-elements-with-node-paths';

test('lists JSX elements with their deletion paths in source order', () => {
	const elements = getJsxElementsWithNodePaths({
		source: `export const Video = () => (
  <AbsoluteFill>
    <Sequence name="Intro" />
    <Series.Sequence durationInFrames={30} />
  </AbsoluteFill>
);`,
	});

	expect(elements.map(({tagName}) => tagName)).toEqual([
		'AbsoluteFill',
		'Sequence',
		'Series.Sequence',
	]);
	expect(elements.every(({nodePath}) => nodePath.length > 0)).toBe(true);
});
