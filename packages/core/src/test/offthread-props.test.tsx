import {renderToString} from 'react-dom/server';
import {expect, test} from 'vitest';
import {OffthreadVideo} from '../video/index.js';

test('Passing imageFormat to OffthreadVideo should throw error', () => {
	expect(() => {
		renderToString(
			<OffthreadVideo
				src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
				// @ts-expect-error
				imageFormat={'JPEG'}
			/>,
		);
	}).toThrow(
		`The \`<OffthreadVideo>\` tag does no longer accept \`imageFormat\`. Use the \`transparent\` prop if you want to render a transparent video.`,
	);
});
