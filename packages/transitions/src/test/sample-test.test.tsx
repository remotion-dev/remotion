import {Thumbnail} from '@remotion/player';
import {expect, test} from 'bun:test';
import type React from 'react';
import {renderToString} from 'react-dom/server';
import {useCurrentFrame} from 'remotion';

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
