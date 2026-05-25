import {expect, test} from 'bun:test';
import {Thumbnail} from '@remotion/player';
import type React from 'react';
import {renderToString} from 'react-dom/server';
import {useCurrentFrame} from 'remotion';
import {bookFlip} from '../presentations/book-flip';
import {dreamyZoom} from '../presentations/dreamy-zoom';
import {linearBlur} from '../presentations/linear-blur';

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

test('bookFlip() should return a presentation', () => {
	const presentation = bookFlip({direction: 'from-top'});
	expect(presentation.props).toEqual({direction: 'from-top'});
	expect(typeof presentation.component).toBe('function');
});

test('linearBlur() should return a presentation', () => {
	const presentation = linearBlur({intensity: 0.2});
	expect(presentation.props).toEqual({intensity: 0.2});
	expect(typeof presentation.component).toBe('function');
});

test('dreamyZoom() should return a presentation', () => {
	const presentation = dreamyZoom({rotation: 8, scale: 1.4});
	expect(presentation.props).toEqual({rotation: 8, scale: 1.4});
	expect(typeof presentation.component).toBe('function');
});
