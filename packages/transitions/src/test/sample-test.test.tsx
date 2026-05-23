import {expect, test} from 'bun:test';
import {Thumbnail} from '@remotion/player';
import type React from 'react';
import {renderToString} from 'react-dom/server';
import {useCurrentFrame} from 'remotion';
import {bookFlip} from '../index';

const Comp: React.FC<{}> = () => {
	const frame = useCurrentFrame();
	const data = `We are on frame ${frame}`;
	return <div>{data}</div>;
};

test('should work', () => {
	const readStream = renderToString(
		<Thumbnail
			component={Comp}
			compositionHeight={1000}
			compositionWidth={1000}
			durationInFrames={1000}
			fps={30}
			frameToDisplay={10}
			noSuspense
		/>,
	);

	expect(readStream).toContain('<div>We are on frame 10</div>');
});

test('should export bookFlip from the package root', () => {
	const presentation = bookFlip({direction: 'from-top'});
	expect(presentation.props).toEqual({direction: 'from-top'});
	expect(typeof presentation.component).toBe('function');
});
