import {expect, test} from 'bun:test';
import {computeCanUpdateDefaultPropsFromContent} from '..';

test('extracts editable default props including special values', () => {
	const source = `import {Composition, staticFile} from 'remotion';

export const Root = () => <Composition
  id="MyComp"
  component={() => null}
  durationInFrames={30}
  fps={30}
  width={1920}
  height={1080}
  defaultProps={{
    title: 'Hello',
    audio: staticFile('my folder/audio #1.wav'),
    publishedAt: new Date('2026-07-29T00:00:00.000Z'),
    options: [{mode: 'fast' as const}],
  }}
/>;`;

	expect(computeCanUpdateDefaultPropsFromContent(source, 'MyComp')).toEqual({
		canUpdate: true,
		currentDefaultProps: {
			title: 'Hello',
			audio: 'remotion-file:my%20folder/audio%20%231.wav',
			publishedAt: 'remotion-date:2026-07-29T00:00:00.000Z',
			options: [{mode: 'fast'}],
		},
	});
});

test('rejects computed default props', () => {
	const source = `import {Composition} from 'remotion';
const defaults = {title: 'Hello'};
export const Root = () => <Composition id="MyComp" component={() => null} durationInFrames={30} fps={30} width={1920} height={1080} defaultProps={defaults} />;`;

	expect(computeCanUpdateDefaultPropsFromContent(source, 'MyComp')).toEqual({
		canUpdate: false,
		reason: 'Could not find or extract defaultProps for composition "MyComp"',
	});
});
