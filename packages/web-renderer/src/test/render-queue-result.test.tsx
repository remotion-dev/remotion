import {expect, test} from 'vitest';
import {renderMediaOnWeb} from '../render-media-on-web';
import {
	onlyOneMediaRenderAtATimeQueue,
	onlyOneStillRenderAtATimeQueue,
} from '../render-operations-queue';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';

const composition = {
	component: () => <div style={{width: 32, height: 32, background: 'red'}} />,
	id: 'queue-result',
	width: 32,
	height: 32,
	fps: 30,
	durationInFrames: 1,
};

test.each(['still', 'media'] as const)(
	'%s queue does not keep completed results and leaves caller results usable',
	async (kind) => {
		const queue =
			kind === 'still'
				? onlyOneStillRenderAtATimeQueue
				: onlyOneMediaRenderAtATimeQueue;
		const render = () =>
			kind === 'still'
				? renderStillOnWeb({
						composition,
						inputProps: {},
						frame: 0,
						licenseKey: 'free-license',
					})
				: renderMediaOnWeb({
						composition,
						inputProps: {},
						container: 'webm',
						videoCodec: 'vp8',
						muted: true,
						outputTarget: 'arraybuffer',
						licenseKey: 'free-license',
					});

		const first = render();
		const second = render();
		const [firstResult, secondResult] = await Promise.all([first, second]);

		await expect(queue.ref).resolves.toBeUndefined();
		for (const result of [firstResult, secondResult]) {
			if ('canvas' in result) {
				const canvas = await result.canvas();
				expect(canvas.width).toBe(32);
				expect(canvas.height).toBe(32);
				expect((await result.blob()).size).toBeGreaterThan(0);
			} else {
				expect((await result.getBlob()).size).toBeGreaterThan(0);
			}
		}
	},
);
