import {unlinkSync} from 'fs';
import {test} from 'vitest';
import {RenderInternals} from '..';
import {compose} from '../compositor/compose';
import {releaseCompositorWithId} from '../compositor/compositor';
import type {CompositorInitiatePayload} from '../compositor/payloads';

const keep = false;

test('Video layers', async () => {
	const renderId = 'abc';

	const compositorInitiatePayload: CompositorInitiatePayload = {
		create_h264_queue: false,
		duration_in_frames: 100,
		fps: 30,
		height: 1080,
		width: 1080,
		video_signals: {
			'/Users/jonathanburger/remotion/packages/example/src/resources/framer.mp4':
				{
					10: 1,
					9: 1,
					8: 1,
					7: 1,
					6: 1,
					5: 1,
					4: 1,
					3: 1,
					2: 1,
					1: 1,
					0: 0,
				},
		},
	};

	for (let i = 0; i < 10; i++) {
		const output = `${process.cwd()}/test${i}.jpeg`;

		await compose({
			height: 1080,
			width: 1080,
			layers: [
				{
					type: 'VideoFrame',
					params: {
						frame: i,
						height: 1080,
						width: 1080,
						src: '/Users/jonathanburger/remotion/packages/example/src/resources/framer.mp4',
						x: 0,
						y: 0,
					},
				},
			],
			compositorInitiatePayload,
			downloadMap: RenderInternals.makeDownloadMap(),
			imageFormat: 'Jpeg',
			output,
			renderId,
		});
		if (!keep) {
			unlinkSync(output);
		}
	}

	releaseCompositorWithId(renderId);
});
